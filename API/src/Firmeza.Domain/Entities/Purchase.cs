namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa una Orden de Compra o Recepción de Materiales.
/// Modela la transacción con el proveedor, montos totales, método de pago,
/// estado de recepción y auditoría de quién recibió la mercancía.
/// </summary>
public class Purchase
{
    public int Id { get; set; }

    /// <summary>
    /// Número o folio de factura de compra o remisión del proveedor.
    /// </summary>
    public string PurchaseNumber { get; set; } = string.Empty;

    /// <summary>
    /// Identificador del proveedor asociado a la orden.
    /// </summary>
    public int SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    /// <summary>
    /// Monto total de la compra o factura.
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Estado de la orden (Received, Cancelled).
    /// </summary>
    public string Status { get; set; } = "Received";

    /// <summary>
    /// Método de pago acordado (Efectivo, Crédito 30 días, Transferencia, etc).
    /// </summary>
    public string PaymentMethod { get; set; } = string.Empty;

    /// <summary>
    /// Observaciones, notas de entrega o condiciones comerciales.
    /// </summary>
    public string Notes { get; set; } = string.Empty;

    /// <summary>
    /// Nombre o identidad del usuario o empleado que registró la recepción de mercancía.
    /// </summary>
    public string ReceivedBy { get; set; } = string.Empty;

    /// <summary>
    /// Identificador de la empresa ferretera titular de la compra.
    /// </summary>
    public int? EnterpriseId { get; set; }
    public Enterprise? Enterprise { get; set; }

    /// <summary>
    /// Fecha y hora en la que se registró la recepción de mercancía.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Renglones y materiales detallados incluidos en la compra (1:N).
    /// </summary>
    public ICollection<PurchaseDetail> Details { get; set; } = new List<PurchaseDetail>();
}
