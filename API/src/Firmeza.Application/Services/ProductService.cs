using System.Collections.Concurrent;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;

namespace Firmeza.Application.Services;

/// <summary>
/// Servicio de aplicación que gestiona la lógica de negocio del catálogo de productos.
/// Aplica la regla estricta de que el stock jamás puede ser negativo y determina
/// el estado crítico cuando las existencias son inferiores a 5 unidades.
/// </summary>
public class ProductService : IProductService
{
    // Catálogo activo en memoria (inicia sin datos falsos, gestionado por operaciones de usuario)
    private static readonly ConcurrentDictionary<string, ProductDto> _catalog = new();

    public IEnumerable<ProductDto> GetAll()
    {
        return _catalog.Values.OrderByDescending(p => p.Id);
    }

    public ProductDto? GetById(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) return null;

        if (_catalog.TryGetValue(id, out var product))
        {
            return product;
        }

        // Búsqueda por SKU
        return _catalog.Values.FirstOrDefault(p => p.Sku.Equals(id, StringComparison.OrdinalIgnoreCase));
    }

    public ProductDto Create(CreateProductRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.Sku))
        {
            throw new InvalidOperationException("El código SKU es obligatorio para registrar un producto.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("El nombre del producto es obligatorio.");
        }

        // Regla de Negocio Firmeza: El stock no puede ser negativo
        if (request.Stock < 0)
        {
            throw new InvalidOperationException("El stock de un producto no puede ser negativo.");
        }

        var cleanSku = request.Sku.Trim().ToUpperInvariant();

        // Verificar si ya existe el SKU
        if (_catalog.Values.Any(p => p.Sku.Equals(cleanSku, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"El producto con SKU '{cleanSku}' ya se encuentra registrado.");
        }

        var id = $"PRD-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        var barcode = $"{Random.Shared.NextInt64(100000000000, 999999999999)}";
        var (status, statusClass, percent) = CalculateStockMetrics(request.Stock);

        var product = new ProductDto(
            Id: id,
            Sku: cleanSku,
            Barcode: barcode,
            Name: request.Name.Trim(),
            Category: string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            CategoryDetail: string.IsNullOrWhiteSpace(request.CategoryDetail) ? "Inventario Firmeza" : request.CategoryDetail.Trim(),
            Location: string.IsNullOrWhiteSpace(request.Location) ? "Nave A-P01-R1" : request.Location.Trim(),
            StockTotal: $"{request.Stock} Unid.",
            StockReserved: "0",
            StockAvailable: $"{request.Stock}",
            StockLevelPercent: percent,
            StockStatus: status,
            StockStatusClass: statusClass,
            CostPrice: string.IsNullOrWhiteSpace(request.CostPrice) ? "$10.00" : request.CostPrice.Trim(),
            SalePrice: string.IsNullOrWhiteSpace(request.SalePrice) ? "$15.00" : request.SalePrice.Trim(),
            LastMovement: "Recién registrado",
            ImageIcon: string.IsNullOrWhiteSpace(request.ImageIcon) ? "📦" : request.ImageIcon.Trim()
        );

        _catalog[id] = product;
        return product;
    }

    public ProductDto? Update(string id, UpdateProductRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(id)) return null;

        var existing = GetById(id);
        if (existing is null)
        {
            return null;
        }

        // Regla de Negocio Firmeza: El stock no puede ser negativo
        if (request.Stock < 0)
        {
            throw new InvalidOperationException("El stock de un producto no puede ser negativo.");
        }

        var (status, statusClass, percent) = CalculateStockMetrics(request.Stock);

        var updated = existing with
        {
            Name = string.IsNullOrWhiteSpace(request.Name) ? existing.Name : request.Name.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? existing.Category : request.Category.Trim(),
            CategoryDetail = string.IsNullOrWhiteSpace(request.CategoryDetail) ? existing.CategoryDetail : request.CategoryDetail.Trim(),
            Location = string.IsNullOrWhiteSpace(request.Location) ? existing.Location : request.Location.Trim(),
            StockTotal = $"{request.Stock} Unid.",
            StockAvailable = $"{request.Stock}",
            StockLevelPercent = percent,
            StockStatus = status,
            StockStatusClass = statusClass,
            CostPrice = string.IsNullOrWhiteSpace(request.CostPrice) ? existing.CostPrice : request.CostPrice.Trim(),
            SalePrice = string.IsNullOrWhiteSpace(request.SalePrice) ? existing.SalePrice : request.SalePrice.Trim(),
            LastMovement = "Actualizado recientemente",
            ImageIcon = string.IsNullOrWhiteSpace(request.ImageIcon) ? existing.ImageIcon : request.ImageIcon.Trim()
        };

        _catalog[existing.Id] = updated;
        return updated;
    }

    public bool Delete(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) return false;

        var existing = GetById(id);
        if (existing is null) return false;

        return _catalog.TryRemove(existing.Id, out _);
    }

    /// <summary>
    /// Regla: Menos de 5 unidades se cataloga como STOCK CRÍTICO (crítico / rojo en la interfaz).
    /// </summary>
    private static (string Status, string StatusClass, int Percent) CalculateStockMetrics(int availableStock)
    {
        if (availableStock < 5)
        {
            return ("STOCK CRÍTICO", "critical", Math.Min(100, Math.Max(5, availableStock * 10)));
        }

        if (availableStock <= 20)
        {
            return ("ESTABLE", "stable", Math.Min(100, availableStock * 4));
        }

        return ("ÓPTIMO", "optimal", Math.Min(100, 50 + (availableStock / 2)));
    }
}
