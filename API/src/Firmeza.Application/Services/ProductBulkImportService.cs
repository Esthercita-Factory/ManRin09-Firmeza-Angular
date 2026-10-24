using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;

namespace Firmeza.Application.Services;

/// <summary>
/// Implementa las reglas de negocio de la importación masiva:
/// 1. Normaliza los datos de cada fila (recorte de espacios, SKU en mayúsculas).
/// 2. Consolida SKUs repetidos dentro del mismo archivo.
/// 3. Separa productos nuevos de existentes (filtrando por empresa).
/// 4. Aplica la estrategia de conflicto (SumStock / Overwrite).
/// 5. Persiste todo en una sola transacción.
/// </summary>
public class ProductBulkImportService(IProductRepository productRepository) : IProductBulkImportService
{
    private const string DefaultLocation = "Sin asignar";
    private const int DefaultMinStock = 5;
    private const int MaxStock = 100000;

    public async Task<BulkImportResultDto> ImportAsync(
        BulkImportRequestDto request,
        ImportActorContext actor,
        CancellationToken ct = default)
    {
        var warnings = new List<string>();
        var overwrite = string.Equals(request.ConflictMode, BulkImportConflictModes.Overwrite, StringComparison.Ordinal);

        // 1 y 2. Normalizar y consolidar SKUs repetidos en el archivo
        var consolidated = ConsolidateRows(request.Products, warnings);

        // 3. Buscar en un solo viaje a BD los SKUs que ya existen en la empresa
        var existingProducts = await productRepository.GetBySkusAsync(consolidated.Keys, actor.EnterpriseId, ct);
        var existingBySku = existingProducts
            .GroupBy(p => p.Sku.Trim().ToUpperInvariant())
            .ToDictionary(g => g.Key, g => g.First());

        var toInsert = new List<Product>();
        var toUpdate = new List<Product>();
        var now = DateTime.UtcNow;

        foreach (var (sku, row) in consolidated)
        {
            if (existingBySku.TryGetValue(sku, out var existing))
            {
                // 4. Aplicar estrategia sobre el producto existente
                if (overwrite)
                {
                    ApplyOverwrite(existing, row);
                }
                else
                {
                    var newStock = existing.Stock + row.Stock;
                    if (newStock > MaxStock)
                    {
                        warnings.Add($"SKU {sku}: el stock resultante ({newStock}) supera el máximo permitido ({MaxStock}); se ajustó a {MaxStock}.");
                        newStock = MaxStock;
                    }

                    existing.Stock = newStock;
                }

                if (!existing.IsActive)
                {
                    warnings.Add($"SKU {sku}: el producto existe pero está inactivo; se actualizó sin reactivarlo.");
                }

                existing.LastMovement = actor.RegisteredByName;
                existing.UpdatedAt = now;
                toUpdate.Add(existing);
            }
            else
            {
                toInsert.Add(CreateProduct(row, actor, now));
            }
        }

        // 5. Persistencia atómica
        await productRepository.BulkUpsertAsync(toInsert, toUpdate, ct);

        return new BulkImportResultDto(
            TotalReceived: request.Products.Count,
            TotalProcessed: toInsert.Count + toUpdate.Count,
            TotalCreated: toInsert.Count,
            TotalUpdated: toUpdate.Count,
            ConflictMode: overwrite ? BulkImportConflictModes.Overwrite : BulkImportConflictModes.SumStock,
            Warnings: warnings);
    }

    /// <summary>
    /// Agrupa filas por SKU normalizado. Si un SKU se repite, suma sus cantidades
    /// y conserva los datos descriptivos y precios de la última aparición.
    /// </summary>
    private static Dictionary<string, BulkImportProductItemDto> ConsolidateRows(
        IEnumerable<BulkImportProductItemDto> rows,
        List<string> warnings)
    {
        var result = new Dictionary<string, BulkImportProductItemDto>(StringComparer.Ordinal);
        var occurrences = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var raw in rows)
        {
            var row = Normalize(raw);
            var sku = row.Sku;

            if (result.TryGetValue(sku, out var previous))
            {
                result[sku] = row with { Stock = Math.Min(previous.Stock + row.Stock, MaxStock) };
                occurrences[sku]++;
            }
            else
            {
                result[sku] = row;
                occurrences[sku] = 1;
            }
        }

        foreach (var (sku, count) in occurrences.Where(o => o.Value > 1))
        {
            warnings.Add($"SKU {sku}: aparece {count} veces en el archivo; las cantidades se sumaron y se usaron los datos de la última fila.");
        }

        return result;
    }

    private static BulkImportProductItemDto Normalize(BulkImportProductItemDto row) => row with
    {
        Sku = row.Sku.Trim().ToUpperInvariant(),
        Name = row.Name.Trim(),
        Category = row.Category.Trim(),
        Description = string.IsNullOrWhiteSpace(row.Description) ? null : row.Description.Trim(),
        Location = string.IsNullOrWhiteSpace(row.Location) ? null : row.Location.Trim(),
        Barcode = string.IsNullOrWhiteSpace(row.Barcode) ? null : row.Barcode.Trim(),
        CostPrice = decimal.Round(row.CostPrice, 2),
        SalePrice = decimal.Round(row.SalePrice, 2)
    };

    /// <summary>
    /// Reemplaza los datos del producto existente. Los campos opcionales vacíos en el archivo
    /// no borran la información previa (solo se sobrescriben si vienen informados).
    /// </summary>
    private static void ApplyOverwrite(Product existing, BulkImportProductItemDto row)
    {
        existing.Name = row.Name;
        existing.Category = row.Category;
        existing.Stock = row.Stock;
        existing.CostPrice = row.CostPrice;
        existing.Price = row.SalePrice;

        if (row.Description is not null) existing.Description = row.Description;
        if (row.Location is not null) existing.Location = row.Location;
        if (row.Barcode is not null) existing.Barcode = row.Barcode;
        if (row.MinStock.HasValue) existing.MinStock = row.MinStock.Value;
    }

    private static Product CreateProduct(BulkImportProductItemDto row, ImportActorContext actor, DateTime now) => new()
    {
        Id = Guid.NewGuid(),
        Sku = row.Sku,
        Barcode = row.Barcode ?? string.Empty,
        Name = row.Name,
        Description = row.Description ?? string.Empty,
        Category = row.Category,
        CategoryDetail = string.Empty,
        Location = row.Location ?? DefaultLocation,
        UnitOfMeasure = string.IsNullOrWhiteSpace(row.UnitOfMeasure) ? "Unidad" : row.UnitOfMeasure.Trim(),
        CostPrice = row.CostPrice,
        Price = row.SalePrice,
        Stock = row.Stock,
        StockReserved = 0,
        MinStock = row.MinStock ?? DefaultMinStock,
        IsActive = true,
        RegisteredById = actor.RegisteredById,
        LastMovement = actor.RegisteredByName,
        EnterpriseId = actor.EnterpriseId,
        CreatedAt = now
    };
}
