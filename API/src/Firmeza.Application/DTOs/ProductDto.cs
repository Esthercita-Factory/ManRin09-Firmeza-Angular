using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Firmeza.Application.DTOs;

/// <summary>
/// Convertidor JSON flexible para campos monetarios/decimales.
/// Permite leer tanto valores numéricos puros (10000.00) como cadenas formateadas ("$10000.00", "10,000.00").
/// </summary>
public class DecimalFlexConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetDecimal();
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str)) return 0m;
            var clean = Regex.Replace(str, @"[^0-9.-]", "");
            if (decimal.TryParse(clean, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
            {
                return result;
            }
        }

        return 0m;
    }

    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(value);
    }
}

/// <summary>
/// DTO de respuesta para la información completa de un producto en catálogo.
/// Basado en el estándar de EmployeeResponseDto.
/// </summary>
public record ProductResponseDto(
    Guid Id,
    string Sku,
    string Barcode,
    string Name,
    string Description,
    string Category,
    string CategoryDetail,
    string UnitOfMeasure,
    string Location,
    decimal CostPrice,
    decimal Price,
    int Stock,
    int StockReserved,
    int MinStock,
    bool IsActive,
    Guid? RegisteredById,
    string RegisteredByName,
    int? EnterpriseId,
    string? EnterpriseName,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

/// <summary>
/// DTO de catálogo compatible con vistas resumidas en el frontend y servicios de inventario.
/// </summary>
public record ProductDto(
    string Id,
    string Sku,
    string Barcode,
    string Name,
    string Description,
    string Category,
    string CategoryDetail,
    string Location,
    string StockTotal,
    string StockReserved,
    string StockAvailable,
    int StockLevelPercent,
    string StockStatus,
    string StockStatusClass,
    string CostPrice,
    string SalePrice,
    string LastMovement,
    int MinStock,
    Guid? RegisteredById,
    int? EnterpriseId,
    string UnitOfMeasure = "Unidad"
);

/// <summary>
/// DTO para el registro de un nuevo producto en inventario.
/// Basado en el estándar de CreateEmployeeRequestDto con límites ajustados.
/// Omite datos autogenerados (Id, Timestamps) y RegisteredById (obtenido desde las claims JWT).
/// <summary>
/// DTO para el registro de un nuevo producto en inventario.
/// Basado en el estándar de CreateEmployeeRequestDto con límites ajustados.
/// Omite datos autogenerados (Id, Timestamps) y RegisteredById (obtenido desde las claims JWT).
/// </summary>
public record CreateProductRequestDto : IValidatableObject
{
    [Required(ErrorMessage = "El código SKU es obligatorio.")]
    [MaxLength(30, ErrorMessage = "El código SKU no puede superar 30 caracteres.")]
    public string Sku { get; init; } = string.Empty;

    [MaxLength(30, ErrorMessage = "El código de barras no puede superar 30 caracteres.")]
    public string? Barcode { get; init; }

    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [MaxLength(80, ErrorMessage = "El nombre no puede superar 80 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [MaxLength(500, ErrorMessage = "La descripción no puede superar 500 caracteres.")]
    public string? Description { get; init; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    [MaxLength(40, ErrorMessage = "La categoría no puede superar 40 caracteres.")]
    public string Category { get; init; } = string.Empty;

    [MaxLength(50, ErrorMessage = "El detalle de categoría no puede superar 50 caracteres.")]
    public string? CategoryDetail { get; init; }

    [MaxLength(30, ErrorMessage = "La unidad de medida no puede superar 30 caracteres.")]
    public string UnitOfMeasure { get; init; } = "Unidad";

    [Required(ErrorMessage = "La ubicación en almacén es obligatoria.")]
    [MaxLength(30, ErrorMessage = "La ubicación no puede superar 30 caracteres.")]
    public string Location { get; init; } = string.Empty;

    [Required(ErrorMessage = "El precio de costo es obligatorio.")]
    [Range(0, 10000000, ErrorMessage = "El precio de costo no puede ser negativo.")]
    [JsonConverter(typeof(DecimalFlexConverter))]
    public decimal CostPrice { get; init; }

    private readonly decimal _price;

    [Required(ErrorMessage = "El precio de venta es obligatorio.")]
    [Range(0.01, 10000000, ErrorMessage = "El precio de venta debe ser mayor a cero.")]
    [JsonConverter(typeof(DecimalFlexConverter))]
    public decimal Price
    {
        get => _price;
        init => _price = value;
    }

    [JsonConverter(typeof(DecimalFlexConverter))]
    public decimal? SalePrice
    {
        get => _price;
        init
        {
            if (value.HasValue && _price == 0)
            {
                _price = value.Value;
            }
        }
    }

    [Required(ErrorMessage = "El stock inicial es obligatorio.")]
    [Range(0, 100000, ErrorMessage = "El stock no puede ser negativo.")]
    public int Stock { get; init; }

    public int StockReserved { get; init; } = 0;

    [Range(0, 100000, ErrorMessage = "El stock mínimo no puede ser negativo.")]
    public int MinStock { get; init; } = 5;

    public int? EnterpriseId { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Price <= 0)
        {
            yield return new ValidationResult(
                "El precio de venta debe ser mayor a cero.",
                [nameof(Price)]);
        }

        if (Price < CostPrice)
        {
            yield return new ValidationResult(
                $"El precio de venta (${Price:F2}) no puede ser menor al precio de costo (${CostPrice:F2}) sin autorización explícita.",
                [nameof(Price)]);
        }
    }
}

/// <summary>
/// DTO para la actualización de un producto existente.
/// Basado en el estándar de UpdateEmployeeRequestDto con límites ajustados.
/// </summary>
public record UpdateProductRequestDto : IValidatableObject
{
    [MaxLength(30, ErrorMessage = "El código SKU no puede superar 30 caracteres.")]
    public string? Sku { get; init; }

    [MaxLength(30, ErrorMessage = "El código de barras no puede superar 30 caracteres.")]
    public string? Barcode { get; init; }

    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [MaxLength(80, ErrorMessage = "El nombre no puede superar 80 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [MaxLength(500, ErrorMessage = "La descripción no puede superar 500 caracteres.")]
    public string? Description { get; init; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    [MaxLength(40, ErrorMessage = "La categoría no puede superar 40 caracteres.")]
    public string Category { get; init; } = string.Empty;

    [MaxLength(50, ErrorMessage = "El detalle de categoría no puede superar 50 caracteres.")]
    public string? CategoryDetail { get; init; }

    [MaxLength(30, ErrorMessage = "La unidad de medida no puede superar 30 caracteres.")]
    public string UnitOfMeasure { get; init; } = "Unidad";

    [Required(ErrorMessage = "La ubicación en almacén es obligatoria.")]
    [MaxLength(30, ErrorMessage = "La ubicación no puede superar 30 caracteres.")]
    public string Location { get; init; } = string.Empty;

    [Required(ErrorMessage = "El precio de costo es obligatorio.")]
    [Range(0, 10000000, ErrorMessage = "El precio de costo no puede ser negativo.")]
    [JsonConverter(typeof(DecimalFlexConverter))]
    public decimal CostPrice { get; init; }

    private readonly decimal _price;

    [Required(ErrorMessage = "El precio de venta es obligatorio.")]
    [Range(0.01, 10000000, ErrorMessage = "El precio de venta debe ser mayor a cero.")]
    [JsonConverter(typeof(DecimalFlexConverter))]
    public decimal Price
    {
        get => _price;
        init => _price = value;
    }

    [JsonConverter(typeof(DecimalFlexConverter))]
    public decimal? SalePrice
    {
        get => _price;
        init
        {
            if (value.HasValue && _price == 0)
            {
                _price = value.Value;
            }
        }
    }

    [Required(ErrorMessage = "El stock es obligatorio.")]
    [Range(0, 100000, ErrorMessage = "El stock no puede ser negativo.")]
    public int Stock { get; init; }

    public int StockReserved { get; init; } = 0;

    [Range(0, 100000, ErrorMessage = "El stock mínimo no puede ser negativo.")]
    public int MinStock { get; init; } = 5;

    public bool IsActive { get; init; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Price <= 0)
        {
            yield return new ValidationResult(
                "El precio de venta debe ser mayor a cero.",
                [nameof(Price)]);
        }

        if (Price < CostPrice)
        {
            yield return new ValidationResult(
                $"El precio de venta (${Price:F2}) no puede ser menor al precio de costo (${CostPrice:F2}) sin autorización explícita.",
                [nameof(Price)]);
        }
    }
}

/// <summary>
/// Parámetros de consulta para paginación y filtrado en servidor del catálogo de productos.
/// Soporta búsqueda por texto (nombre, SKU, código de barras), categoría, rango de precios y disponibilidad.
/// </summary>
public record ProductFilterDto
{
    public string? Search { get; init; }
    public string? Category { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public bool? InStockOnly { get; init; }
    public int? EnterpriseId { get; init; }

    private readonly int _page = 1;
    public int Page
    {
        get => _page;
        init => _page = value < 1 ? 1 : value;
    }

    private readonly int _pageSize = 20;
    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value switch
        {
            < 1 => 1,
            > 100 => 100,
            _ => value
        };
    }
}

/// <summary>
/// Contenedor genérico para resultados paginados en el servidor.
/// </summary>
/// <typeparam name="T">Tipo del elemento paginado.</typeparam>
public record PagedResultDto<T>(
    IReadOnlyCollection<T> Items,
    int TotalCount,
    int Page,
    int PageSize)
{
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}
