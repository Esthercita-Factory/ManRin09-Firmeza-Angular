using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Firmeza.Infrastructure.Services;

/// <summary>
/// Servicio de aplicación que implementa la lógica transaccional de compras y recepción de materiales.
/// Cumple con:
/// - AC-PUR-01: Suma automática de cantidades recibidas al stock actual del producto.
/// - AC-PUR-02: Actualización de costos de referencia mediante la fórmula de Precio Medio Ponderado (PMP).
/// </summary>
public class PurchaseService(
    ApplicationDbContext context,
    IPurchaseRepository purchaseRepository,
    ISupplierRepository supplierRepository,
    ILogger<PurchaseService> logger) : IPurchaseService
{
    private static PurchaseResponseDto MapToDto(Purchase p) => MapToDto(p, null);

    private static PurchaseResponseDto MapToDto(Purchase p, string? supplierNameOverride)
    {
        var supplierName = supplierNameOverride
            ?? (p.Supplier is not null ? p.Supplier.Name : $"Proveedor #{p.SupplierId}");

        var details = (p.Details ?? []).Select(d => new PurchaseDetailResponseDto(
            d.Id,
            d.ProductId,
            d.Product?.Name ?? "Producto",
            d.Product?.Sku ?? string.Empty,
            d.Quantity,
            d.UnitCost,
            d.Subtotal
        )).ToList();

        return new PurchaseResponseDto(
            p.Id,
            p.PurchaseNumber,
            p.SupplierId,
            supplierName,
            p.TotalAmount,
            p.Status,
            p.PaymentMethod,
            p.Notes,
            p.ReceivedBy,
            p.CreatedAt,
            details
        );
    }

    public async Task<IEnumerable<PurchaseResponseDto>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default)
    {
        var purchases = await purchaseRepository.GetAllAsync(enterpriseId, ct);
        return purchases.Select(MapToDto);
    }

    public async Task<PurchaseResponseDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var purchase = await purchaseRepository.GetByIdAsync(id, ct);
        return purchase is not null ? MapToDto(purchase) : null;
    }

    public async Task<IEnumerable<PurchaseResponseDto>> GetBySupplierIdAsync(int supplierId, CancellationToken ct = default)
    {
        var purchases = await purchaseRepository.GetBySupplierIdAsync(supplierId, ct);
        return purchases.Select(MapToDto);
    }

    public async Task<PurchaseResponseDto> CreateAsync(
        CreatePurchaseRequestDto request,
        string receivedByName,
        int? enterpriseId = null,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        // 1. Validar existencia del proveedor
        var supplier = await supplierRepository.GetByIdAsync(request.SupplierId, ct);
        if (supplier is null)
        {
            throw new InvalidOperationException($"El proveedor con ID {request.SupplierId} no existe.");
        }

        if (!supplier.IsActive)
        {
            throw new InvalidOperationException($"El proveedor '{supplier.Name}' se encuentra inactivo.");
        }

        // 2. Validar que la orden contenga al menos un renglón
        if (request.Items == null || request.Items.Count == 0)
        {
            throw new InvalidOperationException("Debe incluir al menos un producto en la orden de compra.");
        }

        // 3. Iniciar Transacción Atómica
        await using var transaction = await context.Database.BeginTransactionAsync(ct);

        try
        {
            var purchaseDetails = new List<PurchaseDetail>();
            var totalAmount = 0m;

            // Consolidar productos duplicados en la misma orden si existiesen
            var groupedItems = request.Items
                .GroupBy(i => i.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    Quantity = g.Sum(x => x.Quantity),
                    UnitCost = g.First().UnitCost
                })
                .ToList();

            foreach (var item in groupedItems)
            {
                var product = await context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId, ct);
                if (product is null)
                {
                    throw new InvalidOperationException($"El producto con ID '{item.ProductId}' no existe en el catálogo.");
                }

                var currentStock = product.Stock;
                var currentCost = product.CostPrice;
                var receivedQty = item.Quantity;
                var incomingCost = item.UnitCost;

                // AC-PUR-02: Cálculo del Precio Medio Ponderado (PMP)
                // Si el stock actual es 0 o negativo, el nuevo costo es directamente el costo de la compra entrante.
                // Si hay existencias previas, se ponderan:
                // PMP = ((StockActual * CostoActual) + (CantidadEntrante * CostoEntrante)) / (StockActual + CantidadEntrante)
                decimal newCostPrice;
                if (currentStock <= 0)
                {
                    newCostPrice = incomingCost;
                }
                else
                {
                    var totalValue = (currentStock * currentCost) + (receivedQty * incomingCost);
                    var newTotalQty = currentStock + receivedQty;
                    newCostPrice = Math.Round(totalValue / newTotalQty, 2);
                }

                // AC-PUR-01: Suma automática de cantidades al stock actual
                product.Stock += receivedQty;
                product.CostPrice = newCostPrice;
                product.UpdatedAt = DateTime.UtcNow;
                product.LastMovement = $"Entrada compra #{request.PurchaseNumber.Trim()} (+{receivedQty} unid. PMP: ${newCostPrice:F2})";

                logger.LogInformation(
                    "Recepción de producto '{ProductName}' (SKU: {Sku}): Stock anterior {OldStock} -> Nuevo {NewStock}. Costo anterior ${OldCost} -> Nuevo PMP ${NewCost}",
                    product.Name, product.Sku, currentStock, product.Stock, currentCost, newCostPrice);

                var detail = new PurchaseDetail
                {
                    ProductId = product.Id,
                    Product = product,
                    Quantity = receivedQty,
                    UnitCost = incomingCost
                };

                totalAmount += (receivedQty * incomingCost);
                purchaseDetails.Add(detail);
            }

            var purchase = new Purchase
            {
                PurchaseNumber = request.PurchaseNumber.Trim(),
                SupplierId = request.SupplierId,
                TotalAmount = totalAmount,
                Status = "Received",
                PaymentMethod = request.PaymentMethod.Trim(),
                Notes = request.Notes?.Trim() ?? string.Empty,
                ReceivedBy = receivedByName,
                EnterpriseId = enterpriseId ?? supplier.EnterpriseId,
                CreatedAt = DateTime.UtcNow,
                Details = purchaseDetails
            };

            await context.Purchases.AddAsync(purchase, ct);
            await context.SaveChangesAsync(ct);

            await transaction.CommitAsync(ct);
            return MapToDto(purchase, supplier.Name);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<bool> CancelAsync(int id, CancellationToken ct = default)
    {
        var purchase = await context.Purchases
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (purchase is null || purchase.Status == "Cancelled")
        {
            return false;
        }

        await using var transaction = await context.Database.BeginTransactionAsync(ct);
        try
        {
            // Revertir existencias recibidas verificando que no queden en negativo
            foreach (var detail in purchase.Details)
            {
                if (detail.Product is not null)
                {
                    if (detail.Product.Stock < detail.Quantity)
                    {
                        throw new InvalidOperationException(
                            $"No es posible cancelar la compra #{purchase.PurchaseNumber}: El producto '{detail.Product.Name}' " +
                            $"tiene existencias actuales ({detail.Product.Stock}) menores a las recibidas en la compra ({detail.Quantity}). " +
                            $"Es posible que parte del lote ya haya sido vendido.");
                    }

                    detail.Product.Stock -= detail.Quantity;
                    detail.Product.UpdatedAt = DateTime.UtcNow;
                    detail.Product.LastMovement = $"Cancelación compra #{purchase.PurchaseNumber} (-{detail.Quantity} unid.)";
                }
            }

            purchase.Status = "Cancelled";
            await context.SaveChangesAsync(ct);

            await transaction.CommitAsync(ct);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
