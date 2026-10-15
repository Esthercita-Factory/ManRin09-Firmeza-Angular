namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa a un Producto en el catálogo e inventario industrial.
/// Modela especificaciones técnicas, trazabilidad de existencias, precios y relaciones multitenant.
/// </summary>
public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Código SKU (Stock Keeping Unit) único del producto (ej: SKU-7720-IPE).
    /// </summary>
    public string Sku { get; set; } = string.Empty;

    /// <summary>
    /// Código de barras internacional o interno (ej: 780992341201).
    /// </summary>
    public string Barcode { get; set; } = string.Empty;

    /// <summary>
    /// Nombre comercial del producto.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Descripción detallada o especificaciones técnicas del material/artículo.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Categoría principal del producto (ej: Construcción y Perfiles, Fijaciones, etc.).
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Subcategoría o detalle técnico del producto (ej: Acero A36, Grado 8 Galvanizado).
    /// </summary>
    public string CategoryDetail { get; set; } = string.Empty;

    /// <summary>
    /// Ubicación física del producto en el almacén (ej: Nave A-P03-R2).
    /// </summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Precio de costo o adquisición unitario.
    /// </summary>
    public decimal CostPrice { get; set; }

    /// <summary>
    /// Precio de venta unitario al público/cliente.
    /// </summary>
    public decimal Price { get; set; }

    /// <summary>
    /// Cantidad física actual disponible en inventario.
    /// </summary>
    public int Stock { get; set; }

    /// <summary>
    /// Cantidad de unidades reservadas o comprometidas en pedidos pendientes.
    /// </summary>
    public int StockReserved { get; set; }

    /// <summary>
    /// Umbral mínimo de existencias para emitir alertas de reabastecimiento o stock crítico.
    /// </summary>
    public int MinStock { get; set; }

    /// <summary>
    /// Estado del producto en el sistema (permite borrado lógico).
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Identificador del usuario que registró el producto inicialmente.
    /// </summary>
    public required Guid RegisteredById { get; set; }

    /// <summary>
    /// Relación con la Empresa / Ferretería propietaria del producto.
    /// </summary>
    public int? EnterpriseId { get; set; }
    public Enterprise? Enterprise { get; set; }

    /// <summary>
    /// Auditoría: fecha de creación y última actualización.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}