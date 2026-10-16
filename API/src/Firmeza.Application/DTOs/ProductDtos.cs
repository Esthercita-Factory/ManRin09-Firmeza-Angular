using System.ComponentModel.DataAnnotations;

namespace Firmeza.Application.DTOs;

public record ProductResponseDto(
    Guid Id,
    string Sku,
    string Barcode,
    string Name,
    string Description,
    string Category,
    string CategoryDetail,
    string Location,
    decimal CostPrice,
    decimal Price,
    int Stock,
    int StockReserved,
    int MinStock,
    bool IsActive,
    Guid RegisteredById,
    int? EnterpriseId,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateProductRequestDto
{
    public string Sku { get; init; } = string.Empty;
    public string Barcode { get; init; } = string.Empty;

    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar los 200 caracteres.")]
    public string Name { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string CategoryDetail { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;

    public decimal CostPrice { get; init; }

    [Required(ErrorMessage = "El precio es obligatorio.")]
    [Range(0.01, 1000000, ErrorMessage = "El precio debe ser mayor a cero.")]
    public decimal Price { get; init; }

    [Required(ErrorMessage = "El stock inicial es obligatorio.")]
    [Range(0, 100000, ErrorMessage = "El stock no puede ser negativo.")]
    public int Stock { get; init; }

    public int StockReserved { get; init; }
    public int MinStock { get; init; }
    public int? EnterpriseId { get; init; }
}

public record UpdateProductRequestDto
{
    public string Sku { get; init; } = string.Empty;
    public string Barcode { get; init; } = string.Empty;

    [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar los 200 caracteres.")]
    public string Name { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string CategoryDetail { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;

    public decimal CostPrice { get; init; }

    [Required(ErrorMessage = "El precio es obligatorio.")]
    [Range(0.01, 1000000, ErrorMessage = "El precio debe ser mayor a cero.")]
    public decimal Price { get; init; }

    [Required(ErrorMessage = "El stock es obligatorio.")]
    [Range(0, 100000, ErrorMessage = "El stock no puede ser negativo.")]
    public int Stock { get; init; }

    public int StockReserved { get; init; }
    public int MinStock { get; init; }
    public bool IsActive { get; init; } = true;
}