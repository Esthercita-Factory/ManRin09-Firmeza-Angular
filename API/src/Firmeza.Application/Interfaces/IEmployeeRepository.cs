using Firmeza.Domain.Entities;

namespace Firmeza.Application.Interfaces;

/// <summary>
/// Contrato del repositorio para la gestión y persistencia de empleados.
/// Garantiza búsquedas por identificador único y número de documento único.
/// </summary>
public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Employee?> GetByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default);
    Task<bool> ExistsByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Employee>> GetByEnterpriseIdAsync(int enterpriseId, CancellationToken cancellationToken = default);
    Task AddAsync(Employee employee, CancellationToken cancellationToken = default);
    Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default);
    Task DeleteAsync(Employee employee, CancellationToken cancellationToken = default);
}
