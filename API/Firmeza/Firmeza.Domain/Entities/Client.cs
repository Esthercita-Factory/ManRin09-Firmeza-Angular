using Firmeza.Domain.Entities.Identity;

namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa a un Cliente / Comprador en el sistema.
/// Modela los datos personales, credenciales, estado y relación 1:N con una empresa (.NET 10).
/// </summary>
public class Client
{
    public int Id { get; set; }

    // Datos personales
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // Contacto y credenciales
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Auditoría y ciclo de vida
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Relación 1:N con Enterprise:
    // Un cliente puede estar vinculado a una ferretería/empresa o actuar como cliente independiente.
    public int? EnterpriseId { get; set; }
    public Enterprise? Enterprise { get; set; }

    // ==========================================
    // Vínculo 1:1 con ASP.NET Core Identity
    // ==========================================
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
}