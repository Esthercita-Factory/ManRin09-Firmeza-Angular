namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que modela el renglón o detalle de un producto específico dentro de una venta.
/// Contiene el producto adquirido, la cantidad despachada, el precio unitario y el subtotal de la línea.
/// </summary>
public class SaleDetail
{
    /// <summary>
    /// Identificador único del detalle de venta.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Identificador de la venta principal a la que pertenece esta línea.
    /// </summary>
    public int SaleId { get; set; }
    public Sale? Sale { get; set; }

    /// <summary>
    /// Identificador del producto vendido.
    /// </summary>
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    /// <summary>
    /// Cantidad de unidades vendidas de este producto.
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Precio unitario al que se vendió el producto en el momento de la transacción.
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Subtotal calculado para este renglón (Cantidad * Precio unitario).
    /// </summary>
    public decimal Subtotal => Quantity * UnitPrice;
}
