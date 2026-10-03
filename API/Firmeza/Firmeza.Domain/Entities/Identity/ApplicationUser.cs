using Microsoft.AspNetCore.Identity;

namespace Firmeza.Domain.Entities.Identity;

/// <summary>
/// Representa la cuenta de usuario gestionada por ASP.NET Core Identity.
/// Almacena únicamente propiedades transversales de autenticación/seguridad y datos comunes.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Nombre completo del usuario a nivel de cuenta/sistema.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Fecha de registro/creación de la cuenta de usuario.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ==========================================
    // PROPIEDADES DE NAVEGACIÓN 1 A 1 (Inversas)
    // ==========================================
    // Un usuario registrado en la plataforma pertenecerá a un Cliente o a una Empresa.
    public Client? Client { get; set; }
    public Enterprise? Enterprise { get; set; }
}
