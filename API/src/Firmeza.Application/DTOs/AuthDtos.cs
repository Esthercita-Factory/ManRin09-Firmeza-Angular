using System.ComponentModel.DataAnnotations;

namespace Firmeza.Application.DTOs;

/// <summary>
/// DTO inmutable para la solicitud de inicio de sesión.
/// </summary>
public sealed record LoginRequestDto(
    [Required(ErrorMessage = "El correo electrónico es obligatorio."), EmailAddress, MaxLength(150)]
    string Email,

    [Required(ErrorMessage = "La contraseña es obligatoria."), MinLength(6)]
    string Password
);

/// <summary>
/// DTO inmutable canónico para la respuesta de autenticación exitosa con JWT y metadatos del usuario.
/// </summary>
public sealed record AuthResponseDto(
    string Token,
    string UserId,
    string Email,
    string Role,
    string FullName,
    DateTime Expiration,
    string AccountType,
    string Message = "Autenticación completada exitosamente."
);

/// <summary>
/// DTO inmutable para el registro directo de una empresa.
/// </summary>
public sealed record RegisterEnterpriseDto(
    [Required, MaxLength(200)] string BusinessName,
    [Required, MaxLength(50)] string TaxId,
    [Required, MaxLength(200)] string ContactName,
    [Required, EmailAddress, MaxLength(150)] string CorporateEmail,
    [Required, MaxLength(50)] string CorporatePhone,
    [Required, MinLength(6)] string Password
);

/// <summary>
/// DTO inmutable para el registro directo de un cliente.
/// </summary>
public sealed record RegisterClientDto(
    [Required, MaxLength(200)] string FirstName,
    [Required, MaxLength(200)] string LastName,
    [Required, EmailAddress, MaxLength(150)] string Email,
    [Required, MaxLength(50)] string Phone,
    [Required, MinLength(6)] string Password
);

/// <summary>
/// DTO de entrada unificado y resiliente adaptado a la carga útil enviada por el formulario web (/register).
/// Soporta tanto el registro corporativo ("empresa") como el personal ("persona").
/// </summary>
public sealed record RegisterRequestDto
{
    /// <summary>
    /// Tipo de cuenta: "persona" | "empresa"
    /// </summary>
    public string AccountType { get; init; } = "persona";

    // Campos comunes requeridos
    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido.")]
    [MaxLength(150, ErrorMessage = "El correo electrónico no puede exceder 150 caracteres.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe contener al menos 6 caracteres.")]
    public string Password { get; init; } = string.Empty;

    [Required(ErrorMessage = "El número telefónico es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El teléfono no puede superar los 50 caracteres.")]
    public string Phone { get; init; } = string.Empty;

    // Nombre completo o de contacto enviado por el frontend / API
    [MaxLength(200)]
    public string? FullName { get; init; }

    [MaxLength(200)]
    public string? Name { get; init; }

    // Campos específicos para Persona Natural
    [MaxLength(200)]
    public string? FirstName { get; init; }

    [MaxLength(200)]
    public string? LastName { get; init; }

    // Campos específicos para Empresa / Organización
    [MaxLength(200)]
    public string? Organization { get; init; }

    [MaxLength(200)]
    public string? CompanyName { get; init; }

    [MaxLength(200)]
    public string? BusinessName { get; init; }

    [MaxLength(50)]
    public string? TaxId { get; init; }
}
