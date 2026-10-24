using Firmeza.Domain.Entities;

namespace Firmeza.Application.Interfaces;

public interface ISupplierRepository
{
    Task<Supplier?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Supplier?> GetByTaxIdAsync(string taxId, int? enterpriseId, CancellationToken ct = default);
    Task<IEnumerable<Supplier>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default);
    Task AddAsync(Supplier supplier, CancellationToken ct = default);
    Task UpdateAsync(Supplier supplier, CancellationToken ct = default);
    Task DeleteAsync(Supplier supplier, CancellationToken ct = default);
}
