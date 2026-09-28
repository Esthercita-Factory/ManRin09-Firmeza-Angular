namespace Firmeza.Domain.Enums;

/// <summary>
/// Define los roles del negocio para la autenticación y autorización en el sistema.
/// </summary>
public enum UserRole
{
    /// <summary>
    /// La empresa que administra su propio inventario y ventas.
    /// </summary>
    Enterprise = 1,

    /// <summary>
    /// Persona natural o comprador que consulta sus compras.
    /// </summary>
    Client = 2,

    /// <summary>
    /// Un cliente que además fue vinculado por una empresa mediante su número de identificación para registrar ventas.
    /// </summary>
    Employee = 3
}
