using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;

namespace Firmeza.Application.Services;

/// <summary>
/// Servicio de aplicación que orquesta la gestión y ciclo de vida de los empleados.
/// Maneja las validaciones de negocio, unicidad de documento y pertenencia a la empresa.
/// </summary>
public class EmployeeService(IEmployeeRepository employeeRepository) : IEmployeeService
{
    public async Task<IEnumerable<EmployeeResponseDto>> GetAllAsync(int enterpriseId, CancellationToken cancellationToken = default)
    {
        var employees = await employeeRepository.GetByEnterpriseIdAsync(enterpriseId, cancellationToken);
        return employees.Select(MapToResponseDto);
    }

    public async Task<EmployeeResponseDto?> GetByIdAsync(int id, int enterpriseId, CancellationToken cancellationToken = default)
    {
        var employee = await employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee is null || employee.EnterpriseId != enterpriseId)
        {
            return null;
        }

        return MapToResponseDto(employee);
    }

    public async Task<EmployeeResponseDto> CreateAsync(int enterpriseId, CreateEmployeeRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var cleanDocument = request.DocumentNumber.Trim();
        if (await employeeRepository.ExistsByDocumentNumberAsync(cleanDocument, cancellationToken))
        {
            throw new InvalidOperationException($"El documento de identidad '{cleanDocument}' ya se encuentra registrado por otro colaborador.");
        }

        var employee = new Employee
        {
            DocumentNumber = cleanDocument,
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim() ?? string.Empty,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Operador" : request.Role.Trim(),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            EnterpriseId = enterpriseId
        };

        await employeeRepository.AddAsync(employee, cancellationToken);

        return MapToResponseDto(employee);
    }

    public async Task<bool> UpdateAsync(int id, int enterpriseId, UpdateEmployeeRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var employee = await employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee is null || employee.EnterpriseId != enterpriseId)
        {
            return false;
        }

        employee.FullName = request.FullName.Trim();
        employee.Phone = request.Phone?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            employee.Role = request.Role.Trim();
        }
        employee.IsActive = request.IsActive;

        await employeeRepository.UpdateAsync(employee, cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, int enterpriseId, CancellationToken cancellationToken = default)
    {
        var employee = await employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee is null || employee.EnterpriseId != enterpriseId)
        {
            return false;
        }

        await employeeRepository.DeleteAsync(employee, cancellationToken);
        return true;
    }

    private static EmployeeResponseDto MapToResponseDto(Employee employee) =>
        new(
            employee.Id,
            employee.DocumentNumber,
            employee.FullName,
            employee.Phone,
            employee.Role,
            employee.IsActive,
            employee.CreatedAt,
            employee.EnterpriseId
        );
}
