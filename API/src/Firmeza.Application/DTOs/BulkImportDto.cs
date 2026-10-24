using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Firmeza.Application.Common.Converters;

namespace Firmeza.Application.DTOs;

/// <summary>
/// Representa una fila de la plantilla oficial de inventario (Excel / CSV).
/// Los límites de longitud coinciden con <see cref="CreateProductRequestDto"/> para mantener consistencia.
/// </summary>
public record BulkImportProductItemDto : IValidatableObject
{
    [Required(ErrorMessage = "El código SKU es obligatorio.")]
    [MaxLength(30, ErrorMessage = "El código SKU no puede superar 30 caracteres.")]
    public string Sku { get; init; } = string.Empty;

    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [MaxLength(80, ErrorMessage = "El nombre no puede superar 80 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [MaxLength(500, ErrorMessage = "La descripción no puede superar 500 caracteres.")]
    public string? Description { get; init; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    [MaxLength(40, ErrorMessage = "La categoría no puede superar 40 caracteres.")]
    public string Category { get; init; } = string.Empty;

    [Range(0, 100000, ErrorMessage = "La cantidad debe estar entre 0 y 100.000.")]
    [JsonConverter(typeof(SmartIntConverter))]
    public int Stock { get; init; }

    [Range(0, 10000000, ErrorMessage = "El precio de costo no puede ser negativo ni superar 10.000.000.")]
    [JsonConverter(typeof(SmartDecimalConverter))]
    public decimal CostPrice { get; init; }

    [Range(0.01, 10000000, ErrorMessage = "El precio de venta debe ser mayor a cero y no superar 10.000.000.")]
    [JsonConverter(typeof(SmartDecimalConverter))]
    public decimal SalePrice { get; init; }

    [MaxLength(30, ErrorMessage = "La ubicación no puede superar 30 caracteres.")]
    public string? Location { get; init; }

    [MaxLength(30, ErrorMessage = "La unidad de medida no puede superar 30 caracteres.")]
    public string? UnitOfMeasure { get; init; }

    [Range(0, 100000, ErrorMessage = "El stock mínimo debe estar entre 0 y 100.000.")]
    public int? MinStock { get; init; }

    [MaxLength(30, ErrorMessage = "El código de barras no puede superar 30 caracteres.")]
    public string? Barcode { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (SalePrice <= 0)
        {
            yield return new ValidationResult(
                $"El precio de venta del SKU '{Sku}' debe ser mayor a cero.",
                [nameof(SalePrice)]);
        }

        if (SalePrice < CostPrice)
        {
            yield return new ValidationResult(
                $"El precio de venta (${SalePrice:F2}) no puede ser menor al precio de costo (${CostPrice:F2}) para el SKU '{Sku}' sin autorización explícita.",
                [nameof(SalePrice)]);
        }
    }
}

/// <summary>
/// Estrategia a aplicar cuando un SKU del archivo ya existe en el inventario de la empresa.
/// </summary>
public static class BulkImportConflictModes
{
    /// <summary>Suma la cantidad del archivo al stock actual. No modifica precios ni datos descriptivos.</summary>
    public const string SumStock = "SumStock";

    /// <summary>Reemplaza stock, precios y datos descriptivos con los valores del archivo.</summary>
    public const string Overwrite = "Overwrite";
}

/// <summary>
/// Cuerpo de la petición POST /api/products/bulk-import.
/// </summary>
public record BulkImportRequestDto
{
    public const int MaxItemsPerBatch = 2000;

    [Required(ErrorMessage = "La lista de productos es obligatoria.")]
    [MinLength(1, ErrorMessage = "Debe enviar al menos un producto.")]
    [MaxLength(MaxItemsPerBatch, ErrorMessage = "No se permite importar más de 2.000 productos por lote.")]
    public List<BulkImportProductItemDto> Products { get; init; } = [];

    [Required(ErrorMessage = "Debe especificar la estrategia para SKUs existentes.")]
    [RegularExpression("^(SumStock|Overwrite)$", ErrorMessage = "El modo de conflicto debe ser 'SumStock' u 'Overwrite'.")]
    public string ConflictMode { get; init; } = BulkImportConflictModes.SumStock;
}

/// <summary>
/// Resultado de la importación masiva devuelto al frontend.
/// </summary>
public record BulkImportResultDto(
    int TotalReceived,
    int TotalProcessed,
    int TotalCreated,
    int TotalUpdated,
    string ConflictMode,
    List<string> Warnings
);
