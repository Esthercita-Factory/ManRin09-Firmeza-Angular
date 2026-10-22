using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

public class ProductRepository(ApplicationDbContext context) : IProductRepository
{
    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<Product?> GetByNameAsync(string name, CancellationToken ct = default)
    {
        return await context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Name == name, ct);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default)
    {
        return await context.Products
            .AnyAsync(p => p.Name == name, ct);
    }

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.Products
            .AsNoTracking()
            .Include(p => p.Enterprise)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Product>> GetByRegisteredByIdAsync(Guid employeeId, CancellationToken ct = default)
    {
        return await context.Products
            .AsNoTracking()
            .Where(p => p.RegisteredById == employeeId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Product product, CancellationToken ct = default)
    {
        await context.Products.AddAsync(product, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Product product, CancellationToken ct = default)
    {
        context.Products.Update(product);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Product product, CancellationToken ct = default)
    {
        context.Products.Remove(product);
        await context.SaveChangesAsync(ct);
    }

    public async Task<List<Product>> GetBySkusAsync(IEnumerable<string> normalizedSkus, int? enterpriseId, CancellationToken ct = default)
    {
        var skus = normalizedSkus.Distinct().ToList();
        if (skus.Count == 0)
        {
            return [];
        }

        // Sin AsNoTracking: las entidades devueltas se modifican y se guardan en BulkUpsertAsync.
        // El filtro por EnterpriseId garantiza el aislamiento entre empresas.
        return await context.Products
            .Where(p => p.EnterpriseId == enterpriseId && skus.Contains(p.Sku.ToUpper()))
            .ToListAsync(ct);
    }

    public async Task BulkUpsertAsync(IEnumerable<Product> toInsert, IEnumerable<Product> toUpdate, CancellationToken ct = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(ct);

        await context.Products.AddRangeAsync(toInsert, ct);

        foreach (var product in toUpdate)
        {
            // Si la entidad ya viene rastreada (GetBySkusAsync), EF detecta los cambios por sí solo.
            if (context.Entry(product).State == EntityState.Detached)
            {
                context.Products.Update(product);
            }
        }

        await context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }
}
