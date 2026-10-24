namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa un ítem o renglón individual dentro de una compra de mercancía.
/// Contiene el material adquirido, cantidad ingresada, costo unitario de compra y subtotal.
/// </summary>
public class PurchaseDetail
{
    public int Id { get; set; }

    /// <summary>
    /// Identificador de la compra principal a la que pertenece esta línea.
    /// </summary>
    public int PurchaseId { get; set; }
    public Purchase? Purchase { get; set; }

    /// <summary>
    /// Identificador del producto recibido en inventario.
    /// </summary>
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    /// <summary>
    /// Cantidad de unidades físicas recibidas.
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Precio de costo unitario pactado en la compra.
    /// </summary>
    public decimal UnitCost { get; set; }

    /// <summary>
    /// Subtotal de la línea (Cantidad * Costo Unitario).
    /// </summary>
    public decimal Subtotal => Quantity * UnitCost;
}
