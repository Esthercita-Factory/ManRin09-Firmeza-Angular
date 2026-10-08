using System.ComponentModel.DataAnnotations;

namespace Firmeza.Application.DTOs;

/// <summary>
/// DTO de respuesta para la información de un empleado.
/// </summary>
public record EmployeeResponseDto(
    int Id,
    string DocumentNumber,
    string FullName,
    string Phone,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    int? EnterpriseId
);

/// <summary>
/// DTO para el registro de un nuevo empleado por parte de una empresa.
/// </summary>
public record CreateEmployeeRequestDto
{
    [Required(ErrorMessage = "El número de documento es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El documento no puede superar 50 caracteres.")]
    public string DocumentNumber { get; init; } = string.Empty;

    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres.")]
    public string FullName { get; init; } = string.Empty;

    [MaxLength(50, ErrorMessage = "El teléfono no puede superar 50 caracteres.")]
    public string Phone { get; init; } = string.Empty;

    [MaxLength(100, ErrorMessage = "El rol no puede superar 100 caracteres.")]
    public string Role { get; init; } = "Operador";

    public bool IsActive { get; init; } = true;
}

/// <summary>
/// DTO para la actualización de un empleado.
/// </summary>
public record UpdateEmployeeRequestDto
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [MaxLength(200)]
    public string FullName { get; init; } = string.Empty;

    [MaxLength(50)]
    public string Phone { get; init; } = string.Empty;

    [MaxLength(100)]
    public string Role { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}
