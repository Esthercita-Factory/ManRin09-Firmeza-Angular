namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa a un Proveedor de insumos o materiales para la ferretería.
/// Permite gestionar los datos fiscales, de contacto y trazabilidad de abastecimiento.
/// </summary>
public class Supplier
{
    public int Id { get; set; }

    /// <summary>
    /// Número de identificación tributaria (NIT, RUT o Cédula jurídica).
    /// </summary>
    public string TaxId { get; set; } = string.Empty;

    /// <summary>
    /// Razón social o nombre comercial del proveedor.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Nombre de la persona o contacto directo en el proveedor.
    /// </summary>
    public string ContactName { get; set; } = string.Empty;

    /// <summary>
    /// Correo electrónico institucional o de pedidos.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Teléfono de contacto comercial.
    /// </summary>
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Dirección física o de bodega del proveedor.
    /// </summary>
    public string Address { get; set; } = string.Empty;

    /// <summary>
    /// Estado activo/inactivo del proveedor en el catálogo.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Identificador de la empresa o ferretería a la que pertenece el registro del proveedor.
    /// </summary>
    public int? EnterpriseId { get; set; }
    public Enterprise? Enterprise { get; set; }

    /// <summary>
    /// Fecha de alta o registro en la plataforma.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Historial de compras y órdenes de abastecimiento asociadas a este proveedor (1:N).
    /// </summary>
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
}
