using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class SupplierRepository(ApplicationDbContext context) : ISupplierRepository
{
    public async Task<Supplier?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await context.Suppliers
            .Include(s => s.Enterprise)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<Supplier?> GetByTaxIdAsync(string taxId, int? enterpriseId, CancellationToken ct = default)
    {
        var clean = taxId.Trim();
        return await context.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.EnterpriseId == enterpriseId && s.TaxId == clean, ct);
    }

    public async Task<IEnumerable<Supplier>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default)
    {
        var query = context.Suppliers
            .Include(s => s.Enterprise)
            .AsNoTracking()
            .AsQueryable();

        if (enterpriseId.HasValue)
        {
            query = query.Where(s => s.EnterpriseId == enterpriseId.Value);
        }

        return await query
            .OrderBy(s => s.Name)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Supplier supplier, CancellationToken ct = default)
    {
        await context.Suppliers.AddAsync(supplier, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Supplier supplier, CancellationToken ct = default)
    {
        context.Suppliers.Update(supplier);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Supplier supplier, CancellationToken ct = default)
    {
        context.Suppliers.Remove(supplier);
        await context.SaveChangesAsync(ct);
    }
}
