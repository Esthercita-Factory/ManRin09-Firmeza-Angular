using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;

namespace Firmeza.Application.Services;

/// <summary>
/// Servicio de validación y reglas de negocio internas para Empleados.
/// Valida restricciones lógicas complejas:
/// - Vigencia y estado activo de la empresa empleadora.
/// - Cumplimiento de políticas internas en la estructura de cargos / roles asignados.
/// - Unicidad de identificación y completitud de datos laborales.
/// </summary>
public class EmployeeValidationService(
    IEnterpriseRepository enterpriseRepository,
    IEmployeeRepository employeeRepository) : IEmployeeValidationService
{
    /// <summary>
    /// Verifica que la empresa esté registrada, vigente y con estado activo.
    /// Si la empresa está inactiva o suspendida, no se permite dar de alta ni gestionar empleados.
    /// </summary>
    public async Task ValidateEnterpriseEligibilityAsync(int enterpriseId, CancellationToken cancellationToken = default)
    {
        var enterprise = await enterpriseRepository.GetByIdAsync(enterpriseId);
        if (enterprise is null)
        {
            throw new InvalidOperationException($"La empresa con ID {enterpriseId} no existe en el sistema.");
        }

        if (!enterprise.IsActive)
        {
            throw new InvalidOperationException($"La empresa '{enterprise.BusinessName}' no está activa o se encuentra suspendida. No puede gestionar empleados.");
        }
    }

    /// <summary>
    /// Valida que el puesto o cargo asignado cumpla con las directrices y longitud mínima de las políticas internas.
    /// </summary>
    public void ValidateRolePolicy(string role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            throw new InvalidOperationException("El rol o cargo del empleado no puede estar vacío.");
        }

        var trimmedRole = role.Trim();

        if (trimmedRole.Length < 3)
        {
            throw new InvalidOperationException("El nombre del cargo asignado debe tener al menos 3 caracteres.");
        }

        if (trimmedRole.Length > 100)
        {
            throw new InvalidOperationException("El cargo asignado excede el límite máximo permitido por la política interna (100 caracteres).");
        }
    }

    /// <summary>
    /// Valida integralmente el alta de un nuevo colaborador:
    /// - Empresa activa y vigente.
    /// - Política de puesto / cargo.
    /// - Unicidad del documento de identificación oficial.
    /// </summary>
    public async Task ValidateCreateEmployeeAsync(int enterpriseId, CreateEmployeeRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        // 1. Validar que la empresa empleadora esté activa y vigente
        await ValidateEnterpriseEligibilityAsync(enterpriseId, cancellationToken);

        // 2. Validar política del cargo
        ValidateRolePolicy(request.Role);

        // 3. Validar unicidad del documento oficial
        var cleanDocument = request.DocumentNumber.Trim();
        if (string.IsNullOrWhiteSpace(cleanDocument))
        {
            throw new InvalidOperationException("El documento de identificación oficial es obligatorio.");
        }

        if (await employeeRepository.ExistsByDocumentNumberAsync(cleanDocument, cancellationToken))
        {
            throw new InvalidOperationException($"El documento de identidad '{cleanDocument}' ya se encuentra registrado por otro colaborador.");
        }
    }

    /// <summary>
    /// Valida la actualización de un colaborador existente:
    /// - Empresa activa y vigente.
    /// - Política de puesto / cargo si fue proporcionado.
    /// </summary>
    public async Task ValidateUpdateEmployeeAsync(int enterpriseId, UpdateEmployeeRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        await ValidateEnterpriseEligibilityAsync(enterpriseId, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            ValidateRolePolicy(request.Role);
        }
    }
}
