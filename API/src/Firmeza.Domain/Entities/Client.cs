using Firmeza.Domain.Entities.Identity;

namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa a un Cliente / Comprador en el sistema.
/// Modela los datos personales, identificación fiscal, credenciales, estado y relación 1:N con una empresa (.NET 10).
/// </summary>
public class Client
{
    public int Id { get; set; }

    // Identificación oficial (Cédula / NIT / Documento único)
    public string DocumentNumber { get; set; } = string.Empty;

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
    public int? EnterpriseId { get; set; }
    public Enterprise? Enterprise { get; set; }

    // Historial de compras (1:N)
    public ICollection<Sale> Sales { get; set; } = [];

    // Vínculo 1:1 con ASP.NET Core Identity
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
}
