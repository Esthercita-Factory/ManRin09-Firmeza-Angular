using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class PurchaseRepository(ApplicationDbContext context) : IPurchaseRepository
{
    public async Task<Purchase?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await context.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<IEnumerable<Purchase>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default)
    {
        var query = context.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .AsNoTracking()
            .AsQueryable();

        if (enterpriseId.HasValue)
        {
            query = query.Where(p => p.EnterpriseId == enterpriseId.Value);
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Purchase>> GetBySupplierIdAsync(int supplierId, CancellationToken ct = default)
    {
        return await context.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .AsNoTracking()
            .Where(p => p.SupplierId == supplierId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Purchase purchase, CancellationToken ct = default)
    {
        await context.Purchases.AddAsync(purchase, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Purchase purchase, CancellationToken ct = default)
    {
        context.Purchases.Update(purchase);
        await context.SaveChangesAsync(ct);
    }
}
