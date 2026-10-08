using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Repositories;

/// <summary>
/// Repositorio de persistencia de empleados mediante EF Core.
/// </summary>
public class EmployeeRepository(ApplicationDbContext context) : IEmployeeRepository
{
    public async Task<Employee?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await context.Employees
            .Include(e => e.Enterprise)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<Employee?> GetByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default)
    {
        return await context.Employees
            .Include(e => e.Enterprise)
            .FirstOrDefaultAsync(e => e.DocumentNumber == documentNumber, cancellationToken);
    }

    public async Task<bool> ExistsByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default)
    {
        return await context.Employees
            .AnyAsync(e => e.DocumentNumber == documentNumber, cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Employees
            .Include(e => e.Enterprise)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetByEnterpriseIdAsync(int enterpriseId, CancellationToken cancellationToken = default)
    {
        return await context.Employees
            .Where(e => e.EnterpriseId == enterpriseId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        await context.Employees.AddAsync(employee, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        context.Employees.Update(employee);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        context.Employees.Remove(employee);
        await context.SaveChangesAsync(cancellationToken);
    }
}
