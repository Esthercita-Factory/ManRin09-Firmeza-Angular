using System.ComponentModel.DataAnnotations;

namespace Firmeza.Application.DTOs;

/// <summary>
/// DTO de respuesta con la información completa de un proveedor.
/// </summary>
public record SupplierResponseDto(
    int Id,
    string TaxId,
    string Name,
    string ContactName,
    string Email,
    string Phone,
    string Address,
    bool IsActive,
    int? EnterpriseId,
    DateTime CreatedAt
);

/// <summary>
/// DTO para la creación o registro de un nuevo proveedor.
/// </summary>
public record CreateSupplierRequestDto
{
    [Required(ErrorMessage = "El NIT o identificación tributaria es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El NIT no puede superar 50 caracteres.")]
    public string TaxId { get; init; } = string.Empty;

    [Required(ErrorMessage = "El nombre o razón social es obligatorio.")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [MaxLength(150, ErrorMessage = "El nombre del contacto no puede superar 150 caracteres.")]
    public string? ContactName { get; init; }

    [EmailAddress(ErrorMessage = "El formato de correo no es válido.")]
    [MaxLength(150, ErrorMessage = "El correo no puede superar 150 caracteres.")]
    public string? Email { get; init; }

    [MaxLength(50, ErrorMessage = "El teléfono no puede superar 50 caracteres.")]
    public string? Phone { get; init; }

    [MaxLength(250, ErrorMessage = "La dirección no puede superar 250 caracteres.")]
    public string? Address { get; init; }

    public int? EnterpriseId { get; init; }
}

/// <summary>
/// DTO para la actualización de un proveedor existente.
/// </summary>
public record UpdateSupplierRequestDto
{
    [Required(ErrorMessage = "El NIT o identificación tributaria es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El NIT no puede superar 50 caracteres.")]
    public string TaxId { get; init; } = string.Empty;

    [Required(ErrorMessage = "El nombre o razón social es obligatorio.")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar 200 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [MaxLength(150, ErrorMessage = "El nombre del contacto no puede superar 150 caracteres.")]
    public string? ContactName { get; init; }

    [EmailAddress(ErrorMessage = "El formato de correo no es válido.")]
    [MaxLength(150, ErrorMessage = "El correo no puede superar 150 caracteres.")]
    public string? Email { get; init; }

    [MaxLength(50, ErrorMessage = "El teléfono no puede superar 50 caracteres.")]
    public string? Phone { get; init; }

    [MaxLength(250, ErrorMessage = "La dirección no puede superar 250 caracteres.")]
    public string? Address { get; init; }

    public bool IsActive { get; init; } = true;
}
