using Firmeza.Domain.Entities;
using Firmeza.Domain.Interfaces;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class EnterpriseRepository : IEnterpriseRepository
{
    private readonly ApplicationDbContext _context;

    public EnterpriseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Enterprise?> GetByIdAsync(int id)
    {
        return await _context.Enterprises
            .Include(e => e.Clients)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Enterprise?> GetByEmailAsync(string email)
    {
        return await _context.Enterprises
            .Include(e => e.Clients)
            .FirstOrDefaultAsync(e => e.CorporateEmail == email);
    }

    public async Task<Enterprise?> GetByTaxIdAsync(string taxId)
    {
        return await _context.Enterprises
            .Include(e => e.Clients)
            .FirstOrDefaultAsync(e => e.TaxId == taxId);
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await _context.Enterprises
            .AnyAsync(e => e.CorporateEmail == email);
    }

    public async Task<bool> ExistsByTaxIdAsync(string taxId)
    {
        return await _context.Enterprises
            .AnyAsync(e => e.TaxId == taxId);
    }

    public async Task AddAsync(Enterprise enterprise)
    {
        await _context.Enterprises.AddAsync(enterprise);
        await _context.SaveChangesAsync();
    }
}
