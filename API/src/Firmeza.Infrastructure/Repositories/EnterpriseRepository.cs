using Firmeza.Domain.Entities;
using Firmeza.Domain.Interfaces;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

/// <summary>
/// Repositorio de empresas con soporte de Identity y dominio completo.
/// </summary>
public class EnterpriseRepository(ApplicationDbContext context) : IEnterpriseRepository
{
    public async Task<Enterprise?> GetByIdAsync(int id)
    {
        return await context.Enterprises
            .Include(e => e.Clients)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Enterprise?> GetByEmailAsync(string email)
    {
        return await context.Enterprises
            .Include(e => e.Clients)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.CorporateEmail == email || (e.User != null && e.User.Email == email));
    }

    public async Task<Enterprise?> GetByTaxIdAsync(string taxId)
    {
        return await context.Enterprises
            .Include(e => e.Clients)
            .FirstOrDefaultAsync(e => e.TaxId == taxId);
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await context.Enterprises
            .AnyAsync(e => e.CorporateEmail == email || (e.User != null && e.User.Email == email));
    }

    public async Task<bool> ExistsByTaxIdAsync(string taxId)
    {
        return await context.Enterprises
            .AnyAsync(e => e.TaxId == taxId);
    }

    public async Task AddAsync(Enterprise enterprise)
    {
        await context.Enterprises.AddAsync(enterprise);
        await context.SaveChangesAsync();
    }
}
