using System.ComponentModel.DataAnnotations;

namespace Firmeza.Application.DTOs;

/// <summary>
/// DTO de respuesta para la información pública y segura de un cliente.
/// </summary>
public record ClientResponseDto(
    int Id,
    string? DocumentNumber,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    bool IsActive,
    DateTime CreatedAt,
    int? EnterpriseId
);

/// <summary>
/// DTO para la creación de un nuevo cliente.
/// </summary>
public record CreateClientRequestDto(
    [Required(ErrorMessage = "El nombre es obligatorio."), MaxLength(100)]
    string FirstName,

    [Required(ErrorMessage = "El apellido es obligatorio."), MaxLength(100)]
    string LastName,

    [Required(ErrorMessage = "El correo electrónico es obligatorio."), EmailAddress(ErrorMessage = "Formato de correo no válido."), MaxLength(150)]
    string Email,

    [Required(ErrorMessage = "La contraseña es obligatoria."), MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    string Password,

    [Required(ErrorMessage = "El teléfono es obligatorio."), MaxLength(50)]
    string Phone,

    [MaxLength(50, ErrorMessage = "El documento no puede superar 50 caracteres.")]
    string? DocumentNumber = null,

    int? EnterpriseId = null
);

/// <summary>
/// DTO para la actualización de datos de un cliente existente.
/// </summary>
public record UpdateClientRequestDto(
    [Required(ErrorMessage = "El nombre es obligatorio."), MaxLength(100)]
    string FirstName,

    [Required(ErrorMessage = "El apellido es obligatorio."), MaxLength(100)]
    string LastName,

    [Required(ErrorMessage = "El teléfono es obligatorio."), MaxLength(50)]
    string Phone,

    bool IsActive,

    [MaxLength(50)]
    string? DocumentNumber = null
);

/// <summary>
/// DTO unificado para clientes.
/// </summary>
public class ClientDto
{
    public int Id { get; set; }
    public string? DocumentNumber { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? EnterpriseId { get; set; }
}
