using Firmeza.Domain.Entities;
using Firmeza.Domain.Interfaces;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly ApplicationDbContext _context;

    public ClientRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Client?> GetByIdAsync(int id)
    {
        return await _context.Clients
            .Include(c => c.Enterprise)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Client?> GetByEmailAsync(string email)
    {
        return await _context.Clients
            .Include(c => c.Enterprise)
            .FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await _context.Clients
            .AnyAsync(c => c.Email == email);
    }

    public async Task AddAsync(Client client)
    {
        await _context.Clients.AddAsync(client);
        await _context.SaveChangesAsync();
    }
}
