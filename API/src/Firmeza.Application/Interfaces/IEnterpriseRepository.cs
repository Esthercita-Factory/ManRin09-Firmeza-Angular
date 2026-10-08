using Firmeza.Domain.Entities;

namespace Firmeza.Application.Interfaces;

public interface IEnterpriseRepository
{
    Task<Enterprise?> GetByIdAsync(int id);
    Task<Enterprise?> GetByEmailAsync(string email);
    Task<Enterprise?> GetByTaxIdAsync(string taxId);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> ExistsByTaxIdAsync(string taxId);
    Task AddAsync(Enterprise enterprise);
}
