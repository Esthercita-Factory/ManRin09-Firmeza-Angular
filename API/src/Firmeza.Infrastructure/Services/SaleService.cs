using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Firmeza.Infrastructure.Services;

/// <summary>
/// Implementación del servicio de ventas con lógica transaccional atómica,
/// deducción automática de existencias y generación dinámica de alertas de inventario.
/// </summary>
public class SaleService(
    ApplicationDbContext context,
    ISaleRepository saleRepository,
    IClientRepository clientRepository,
    ILogger<SaleService> logger) : ISaleService
{
    private static SaleResponseDto MapToDto(Sale s, IReadOnlyCollection<string>? stockAlerts = null)
    {
        var clientName = s.Client is not null
            ? $"{s.Client.FirstName} {s.Client.LastName}".Trim()
            : $"Cliente #{s.ClientId}";

        var details = (s.Details ?? []).Select(d => new SaleDetailResponseDto(
            d.Id,
            d.ProductId,
            d.Product?.Name ?? "Producto",
            d.Product?.Sku ?? string.Empty,
            d.Quantity,
            d.UnitPrice,
            d.Subtotal
        )).ToList();

        return new SaleResponseDto(
            s.Id,
            s.ClientId,
            clientName,
            s.Quantity,
            s.TotalAmount,
            s.PaymentMethod,
            s.IsPaid,
            s.ScheduledBy,
            s.CreatedAt,
            details,
            stockAlerts
        );
    }

    public async Task<IEnumerable<SaleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var sales = await saleRepository.GetAllAsync(cancellationToken);
        return sales.Select(s => MapToDto(s));
    }

    public async Task<SaleResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var sale = await saleRepository.GetByIdAsync(id, cancellationToken);
        return sale is not null ? MapToDto(sale) : null;
    }

    public async Task<IEnumerable<SaleResponseDto>> GetByClientIdAsync(int clientId, CancellationToken cancellationToken = default)
    {
        var sales = await saleRepository.GetByClientIdAsync(clientId, cancellationToken);
        return sales.Select(s => MapToDto(s));
    }

    public async Task<SaleResponseDto> CreateAsync(
        CreateSaleRequestDto request,
        string scheduledByName,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        // 1. Validar existencia del cliente
        var client = await clientRepository.GetByIdAsync(request.ClientId);
        if (client is null)
        {
            throw new InvalidOperationException($"El cliente con ID {request.ClientId} no existe en el sistema.");
        }

        // 2. Validar que la orden contenga al menos un renglón
        if (request.Items == null || request.Items.Count == 0)
        {
            throw new InvalidOperationException("Debe incluir al menos un producto en la venta.");
        }

        // 3. Iniciar Transacción Atómica para garantizar la consistencia entre Venta e Inventario
        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var saleDetails = new List<SaleDetail>();
            var stockAlerts = new List<string>();
            var totalQuantity = 0;
            var totalAmount = 0m;

            // Agrupar ítems por ProductId en caso de duplicados en la misma orden
            var groupedItems = request.Items
                .GroupBy(i => i.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    Quantity = g.Sum(x => x.Quantity),
                    UnitPrice = g.First().UnitPrice
                })
                .ToList();

            foreach (var item in groupedItems)
            {
                var product = await context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId, cancellationToken);
                if (product is null)
                {
                    throw new InvalidOperationException($"El producto con ID '{item.ProductId}' no existe en el catálogo.");
                }

                if (!product.IsActive)
                {
                    throw new InvalidOperationException($"El producto '{product.Name}' (SKU: {product.Sku}) se encuentra inactivo y no puede ser comercializado.");
                }

                // Validación de existencias en almacén
                if (product.Stock < item.Quantity)
                {
                    throw new InvalidOperationException(
                        $"Stock insuficiente para el producto '{product.Name}' (SKU: {product.Sku}). " +
                        $"Existencias disponibles: {product.Stock}, Solicitadas: {item.Quantity}.");
                }

                // Deducción automática de inventario
                product.Stock -= item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
                product.LastMovement = $"Venta de {item.Quantity} unid. ({scheduledByName})";

                // Detección dinámica de alertas de inventario (Stock Crítico / Quiebre)
                if (product.IsOutOfStock)
                {
                    var alert = $"⚠️ ¡QUIEBRE DE STOCK! El producto '{product.Name}' (SKU: {product.Sku}) se ha agotado por completo (0 unidades restantes).";
                    stockAlerts.Add(alert);
                    logger.LogWarning(alert);
                }
                else if (product.IsLowStock)
                {
                    var alert = $"🔔 ¡ALERTA DE STOCK CRÍTICO! El producto '{product.Name}' (SKU: {product.Sku}) ha caído a {product.Stock} unidades (Umbral mínimo: {product.MinStock}).";
                    stockAlerts.Add(alert);
                    logger.LogWarning(alert);
                }

                var unitPrice = item.UnitPrice.HasValue && item.UnitPrice.Value > 0
                    ? item.UnitPrice.Value
                    : product.Price;

                var detail = new SaleDetail
                {
                    ProductId = product.Id,
                    Product = product,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice
                };

                totalQuantity += item.Quantity;
                totalAmount += (item.Quantity * unitPrice);
                saleDetails.Add(detail);
            }

            var sale = new Sale
            {
                ClientId = request.ClientId,
                Client = client,
                Quantity = totalQuantity,
                TotalAmount = totalAmount,
                PaymentMethod = request.PaymentMethod,
                IsPaid = request.IsPaid,
                ScheduledBy = scheduledByName,
                CreatedAt = DateTime.UtcNow,
                Details = saleDetails
            };

            await context.Sales.AddAsync(sale, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);

            // Confirmar transacción atómica
            await transaction.CommitAsync(cancellationToken);

            return MapToDto(sale, stockAlerts);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<SaleResponseDto?> UpdateAsync(
        int id,
        UpdateSaleRequestDto request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var sale = await saleRepository.GetByIdAsync(id, cancellationToken);
        if (sale is null)
        {
            return null;
        }

        sale.Quantity = request.Quantity;
        sale.TotalAmount = request.TotalAmount;
        sale.PaymentMethod = request.PaymentMethod;
        sale.IsPaid = request.IsPaid;

        await saleRepository.UpdateAsync(sale, cancellationToken);

        return MapToDto(sale);
    }

    public async Task<SaleResponseDto?> TogglePaidAsync(int id, CancellationToken cancellationToken = default)
    {
        var sale = await saleRepository.GetByIdAsync(id, cancellationToken);
        if (sale is null)
        {
            return null;
        }

        sale.IsPaid = !sale.IsPaid;
        await saleRepository.UpdateAsync(sale, cancellationToken);

        return MapToDto(sale);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var sale = await context.Sales
            .Include(s => s.Details)
                .ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (sale is null)
        {
            return false;
        }

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Reversión atómica de inventario al cancelar/eliminar la venta
            foreach (var detail in sale.Details)
            {
                if (detail.Product is not null)
                {
                    detail.Product.Stock += detail.Quantity;
                    detail.Product.UpdatedAt = DateTime.UtcNow;
                    detail.Product.LastMovement = $"Reversión de venta #{sale.Id} (+{detail.Quantity} unid.)";
                }
            }

            context.Sales.Remove(sale);
            await context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
