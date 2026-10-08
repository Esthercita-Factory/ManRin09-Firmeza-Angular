using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

/// <summary>
/// Contrato del servicio de aplicación para la gestión de Empleados.
/// Orquesta las operaciones sobre empleados pertenecientes a una empresa.
/// </summary>
public interface IEmployeeService
{
    Task<IEnumerable<EmployeeResponseDto>> GetAllAsync(int enterpriseId, CancellationToken cancellationToken = default);
    Task<EmployeeResponseDto?> GetByIdAsync(int id, int enterpriseId, CancellationToken cancellationToken = default);
    Task<EmployeeResponseDto> CreateAsync(int enterpriseId, CreateEmployeeRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, int enterpriseId, UpdateEmployeeRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, int enterpriseId, CancellationToken cancellationToken = default);
}
