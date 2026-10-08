namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa a un Empleado / Colaborador en el sistema.
/// </summary>
public class Employee
{
    public int Id { get; set; }

    /// <summary>
    /// Número de documento o identificación oficial del empleado (debe ser único).
    /// </summary>
    public string DocumentNumber { get; set; } = string.Empty;

    /// <summary>
    /// Nombre completo del empleado.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Teléfono de contacto del empleado.
    /// </summary>
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Rol o cargo asignado al empleado (permite roles estándar o personalizados).
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Estado del empleado en el sistema (activo o inactivo).
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Fecha de registro en el sistema.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Relación con la Empresa que contrató y gestiona al empleado.
    /// Solo una cuenta de tipo Empresa puede registrar empleados.
    /// </summary>
    public int? EnterpriseId { get; set; }
    public Enterprise? Enterprise { get; set; }
}
