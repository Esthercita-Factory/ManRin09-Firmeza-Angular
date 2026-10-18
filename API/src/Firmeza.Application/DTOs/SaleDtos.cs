using System.ComponentModel.DataAnnotations;

namespace Firmeza.Application.DTOs;

/// <summary>
/// DTO de respuesta para cada línea de producto incluida en una venta.
/// </summary>
public record SaleDetailResponseDto(
    int Id,
    Guid ProductId,
    string ProductName,
    string ProductSku,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);

/// <summary>
/// DTO de respuesta con la información completa de una venta y sus renglones.
/// </summary>
public record SaleResponseDto(
    int Id,
    int ClientId,
    string ClientName,
    int Quantity,
    decimal TotalAmount,
    string PaymentMethod,
    bool IsPaid,
    string ScheduledBy,
    DateTime CreatedAt,
    IReadOnlyCollection<SaleDetailResponseDto> Details,
    IReadOnlyCollection<string>? StockAlerts = null
);

/// <summary>
/// DTO para especificar un producto y su cantidad dentro del carrito / orden de venta.
/// </summary>
public record CreateSaleItemRequestDto
{
    [Required(ErrorMessage = "El identificador del producto es obligatorio.")]
    public Guid ProductId { get; init; }

    [Required(ErrorMessage = "La cantidad del producto es obligatoria.")]
    [Range(1, 100000, ErrorMessage = "La cantidad vendida debe ser de al menos 1 unidad.")]
    public int Quantity { get; init; }

    [Range(0.0, 100000000.0, ErrorMessage = "El precio unitario no puede ser negativo.")]
    public decimal? UnitPrice { get; init; }
}

/// <summary>
/// DTO para la creación de una nueva venta con múltiples productos.
/// </summary>
public record CreateSaleRequestDto
{
    [Required(ErrorMessage = "El identificador del cliente es obligatorio.")]
    [Range(1, int.MaxValue, ErrorMessage = "El identificador del cliente debe ser válido.")]
    public int ClientId { get; init; }

    [Required(ErrorMessage = "Debe incluir al menos un producto en la venta.")]
    [MinLength(1, ErrorMessage = "Debe incluir al menos un producto en la venta.")]
    public List<CreateSaleItemRequestDto> Items { get; init; } = [];

    [Required(ErrorMessage = "El método de pago es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El método de pago no puede superar los 50 caracteres.")]
    public string PaymentMethod { get; init; } = string.Empty;

    public bool IsPaid { get; init; } = false;
}

/// <summary>
/// DTO para la actualización de los datos generales de una venta existente.
/// </summary>
public record UpdateSaleRequestDto
{
    [Required(ErrorMessage = "La cantidad es obligatoria.")]
    [Range(1, 1000000, ErrorMessage = "La cantidad vendida debe ser mayor a 0.")]
    public int Quantity { get; init; }

    [Required(ErrorMessage = "El monto total es obligatorio.")]
    [Range(0.01, 100000000.0, ErrorMessage = "El monto total debe ser mayor a cero.")]
    public decimal TotalAmount { get; init; }

    [Required(ErrorMessage = "El método de pago es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El método de pago no puede superar los 50 caracteres.")]
    public string PaymentMethod { get; init; } = string.Empty;

    public bool IsPaid { get; init; }
}
