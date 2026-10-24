using Firmeza.Domain.Entities;

namespace Firmeza.Application.Interfaces;

public interface IPurchaseRepository
{
    Task<Purchase?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<Purchase>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default);
    Task<IEnumerable<Purchase>> GetBySupplierIdAsync(int supplierId, CancellationToken ct = default);
    Task AddAsync(Purchase purchase, CancellationToken ct = default);
    Task UpdateAsync(Purchase purchase, CancellationToken ct = default);
}
