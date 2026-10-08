using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

/// <summary>
/// Contrato del servicio de validación de reglas de negocio para la gestión de Empleados.
/// Valida restricciones como vigencia de la empresa empleadora, políticas de puesto/cargo y formato de datos.
/// </summary>
public interface IEmployeeValidationService
{
    /// <summary>
    /// Valida que la empresa exista, se encuentre activa y autorizada para incorporar colaboradores.
    /// </summary>
    Task ValidateEnterpriseEligibilityAsync(int enterpriseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Valida que el puesto o cargo asignado cumpla con las políticas internas de la organización.
    /// </summary>
    void ValidateRolePolicy(string role);

    /// <summary>
    /// Valida las reglas de negocio para el alta de un nuevo colaborador.
    /// </summary>
    Task ValidateCreateEmployeeAsync(int enterpriseId, CreateEmployeeRequestDto request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Valida las reglas de negocio para la actualización de un colaborador existente.
    /// </summary>
    Task ValidateUpdateEmployeeAsync(int enterpriseId, UpdateEmployeeRequestDto request, CancellationToken cancellationToken = default);
}
