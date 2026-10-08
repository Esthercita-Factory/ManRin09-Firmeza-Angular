using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

/// <summary>
/// Repositorio de clientes actualizado para la Clean Architecture con soporte de Identity y dominio.
/// </summary>
public class ClientRepository(ApplicationDbContext context) : IClientRepository
{
    public async Task<Client?> GetByIdAsync(int id)
    {
        return await context.Clients
            .Include(c => c.Enterprise)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Client?> GetByEmailAsync(string email)
    {
        return await context.Clients
            .Include(c => c.Enterprise)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Email == email || (c.User != null && c.User.Email == email));
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await context.Clients
            .AnyAsync(c => c.Email == email || (c.User != null && c.User.Email == email));
    }

    public async Task AddAsync(Client client)
    {
        await context.Clients.AddAsync(client);
        await context.SaveChangesAsync();
    }
}
