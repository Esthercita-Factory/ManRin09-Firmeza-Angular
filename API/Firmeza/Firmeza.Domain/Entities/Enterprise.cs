using Firmeza.Domain.Entities.Identity;

namespace Firmeza.Domain.Entities;

/// <summary>
/// Entidad de dominio que representa a una Empresa / Ferretería en el sistema.
/// Modela los datos de negocio, credenciales, estado y relación 1:N con sus clientes asociados (.NET 10).
/// </summary>
public class Enterprise
{
    public int Id { get; set; }

    // Datos de identificación y negocio
    public string BusinessName { get; set; } = string.Empty;
    public string TaxId { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;

    // Datos de contacto y credenciales
    public string CorporateEmail { get; set; } = string.Empty;
    public string CorporatePhone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Auditoría y ciclo de vida
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Relación 1:N: una empresa tiene múltiples clientes asociados
    public ICollection<Client> Clients { get; set; } = [];

    // ==========================================
    // Vínculo 1:1 con ASP.NET Core Identity
    // ==========================================
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
}