using System.ComponentModel.DataAnnotations;

namespace Firmeza.Application.DTOs;

/// <summary>
/// DTO de respuesta para cada línea de material recibida en una compra.
/// </summary>
public record PurchaseDetailResponseDto(
    int Id,
    Guid ProductId,
    string ProductName,
    string ProductSku,
    int Quantity,
    decimal UnitCost,
    decimal Subtotal
);

/// <summary>
/// DTO de respuesta con la información completa de una orden de compra o recepción de mercancía.
/// </summary>
public record PurchaseResponseDto(
    int Id,
    string PurchaseNumber,
    int SupplierId,
    string SupplierName,
    decimal TotalAmount,
    string Status,
    string PaymentMethod,
    string Notes,
    string ReceivedBy,
    DateTime CreatedAt,
    IReadOnlyCollection<PurchaseDetailResponseDto> Details
);

/// <summary>
/// DTO para registrar un producto y cantidad entrante dentro de una orden de compra.
/// </summary>
public record CreatePurchaseItemRequestDto
{
    [Required(ErrorMessage = "El identificador del producto es obligatorio.")]
    public Guid ProductId { get; init; }

    [Required(ErrorMessage = "La cantidad del producto es obligatoria.")]
    [Range(1, 100000, ErrorMessage = "La cantidad comprada debe ser de al menos 1 unidad.")]
    public int Quantity { get; init; }

    [Required(ErrorMessage = "El costo unitario es obligatorio.")]
    [Range(0.01, 10000000.0, ErrorMessage = "El costo unitario debe ser mayor a cero.")]
    public decimal UnitCost { get; init; }
}

/// <summary>
/// DTO para la creación y recepción de una orden de compra (AC-PUR-01 y AC-PUR-02).
/// </summary>
public record CreatePurchaseRequestDto
{
    [Required(ErrorMessage = "El número de factura o comprobante de compra es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El número de compra no puede superar 50 caracteres.")]
    public string PurchaseNumber { get; init; } = string.Empty;

    [Required(ErrorMessage = "El identificador del proveedor es obligatorio.")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un proveedor válido.")]
    public int SupplierId { get; init; }

    [Required(ErrorMessage = "Debe incluir al menos un producto en la compra.")]
    [MinLength(1, ErrorMessage = "Debe incluir al menos un producto en la compra.")]
    public List<CreatePurchaseItemRequestDto> Items { get; init; } = [];

    [Required(ErrorMessage = "El método de pago es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El método de pago no puede superar 50 caracteres.")]
    public string PaymentMethod { get; init; } = string.Empty;

    [MaxLength(1000, ErrorMessage = "Las notas no pueden superar 1000 caracteres.")]
    public string? Notes { get; init; }
}
