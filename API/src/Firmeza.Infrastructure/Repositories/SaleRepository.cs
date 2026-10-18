using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class SaleRepository(ApplicationDbContext context) : ISaleRepository
{
    public async Task<Sale?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await context.Sales
            .Include(s => s.Client)
            .Include(s => s.Details)
                .ThenInclude(d => d.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Sale>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Sales
            .Include(s => s.Client)
            .Include(s => s.Details)
                .ThenInclude(d => d.Product)
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Sale>> GetByClientIdAsync(int clientId, CancellationToken cancellationToken = default)
    {
        return await context.Sales
            .Include(s => s.Client)
            .Include(s => s.Details)
                .ThenInclude(d => d.Product)
            .AsNoTracking()
            .Where(s => s.ClientId == clientId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Sale sale, CancellationToken cancellationToken = default)
    {
        await context.Sales.AddAsync(sale, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Sale sale, CancellationToken cancellationToken = default)
    {
        context.Sales.Update(sale);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Sale sale, CancellationToken cancellationToken = default)
    {
        context.Sales.Remove(sale);
        await context.SaveChangesAsync(cancellationToken);
    }
}
