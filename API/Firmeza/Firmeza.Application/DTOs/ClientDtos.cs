namespace Firmeza.Application.DTOs;

/// <summary>
/// DTO de respuesta para la información pública y segura de un cliente.
/// </summary>
public record ClientResponseDto(
    int Id,
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
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Phone,
    int? EnterpriseId = null
);

/// <summary>
/// DTO para la actualización de datos de un cliente existente.
/// </summary>
public record UpdateClientRequestDto(
    string FirstName,
    string LastName,
    string Phone,
    bool IsActive
);

/// <summary>
/// DTO unificado para clientes.
/// </summary>
public class ClientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? EnterpriseId { get; set; }
}
