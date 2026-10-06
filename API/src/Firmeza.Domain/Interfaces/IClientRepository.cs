using Firmeza.Domain.Entities;

namespace Firmeza.Domain.Interfaces;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(int id);
    Task<Client?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task AddAsync(Client client);
}
