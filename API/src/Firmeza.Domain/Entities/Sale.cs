namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa una Venta en el sistema.
/// Modela los datos de la transacción comercial, cliente asociado,
/// cantidades, montos, método de pago, estado y trazabilidad de quién la agendó.
/// </summary>
public class Sale
{
    /// <summary>
    /// Identificador único de la venta.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Identificador del cliente asociado a la venta.
    /// </summary>
    public int ClientId { get; set; }

    /// <summary>
    /// Referencia de navegación al cliente asociado a la venta.
    /// </summary>
    public Client? Client { get; set; }

    /// <summary>
    /// Cantidad total vendida en la transacción.
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Monto total de la venta.
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Método de pago utilizado (ej: Efectivo, Tarjeta, Transferencia).
    /// </summary>
    public string PaymentMethod { get; set; } = string.Empty;

    /// <summary>
    /// Estado actual de la venta (ej: Pendiente, Completada, Cancelada).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Identificación o nombre de la persona/usuario que agendó la venta.
    /// </summary>
    public string ScheduledBy { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora en la que se registró o agendó la venta.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
