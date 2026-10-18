using Firmeza.Domain.Entities;

namespace Firmeza.Application.Interfaces;

/// <summary>
/// Contrato de repositorio para la persistencia y consulta de ventas.
/// </summary>
public interface ISaleRepository
{
    Task<Sale?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Sale>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Sale>> GetByClientIdAsync(int clientId, CancellationToken cancellationToken = default);
    Task AddAsync(Sale sale, CancellationToken cancellationToken = default);
    Task UpdateAsync(Sale sale, CancellationToken cancellationToken = default);
    Task DeleteAsync(Sale sale, CancellationToken cancellationToken = default);
}
