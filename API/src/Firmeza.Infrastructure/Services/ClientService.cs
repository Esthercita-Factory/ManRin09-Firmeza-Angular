using Firmeza.Application.Common.Interfaces;
using Firmeza.Application.DTOs;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Entities.Identity;
using Firmeza.Infrastructure.DbContext;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.Infrastructure.Services;

/// <summary>
/// Implementación del servicio de gestión de clientes interactuando con EF Core e Identity.
/// </summary>
public class ClientService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager) : IClientService
{
    public async Task<IEnumerable<ClientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Clients
            .AsNoTracking()
            .Include(c => c.User)
            .Select(c => new ClientResponseDto(
                c.Id,
                c.DocumentNumber,
                c.FirstName,
                c.LastName,
                c.User != null ? c.User.Email ?? c.Email : c.Email,
                c.Phone,
                c.IsActive,
                c.CreatedAt,
                c.EnterpriseId
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<ClientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await context.Clients
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.Id == id)
            .Select(c => new ClientResponseDto(
                c.Id,
                c.DocumentNumber,
                c.FirstName,
                c.LastName,
                c.User != null ? c.User.Email ?? c.Email : c.Email,
                c.Phone,
                c.IsActive,
                c.CreatedAt,
                c.EnterpriseId
            ))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ClientResponseDto> CreateAsync(CreateClientRequestDto dto, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(dto);

        // 1. Verificar si el correo ya existe en Identity
        var existingUser = await userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"Ya existe una cuenta registrada con el correo electrónico '{dto.Email}'.");
        }

        // 2. Verificar unicidad de documento si fue provisto
        if (!string.IsNullOrWhiteSpace(dto.DocumentNumber))
        {
            var cleanDoc = dto.DocumentNumber.Trim();
            var docExists = await context.Clients.AnyAsync(
                c => c.EnterpriseId == dto.EnterpriseId && c.DocumentNumber == cleanDoc, 
                cancellationToken);

            if (docExists)
            {
                throw new InvalidOperationException($"Ya existe un cliente con el documento '{cleanDoc}' registrado en la empresa.");
            }
        }

        // 3. Crear el ApplicationUser (Identidad)
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = $"{dto.FirstName} {dto.LastName}".Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Error al crear la cuenta de usuario: {errors}");
        }

        await userManager.AddToRoleAsync(user, "Client");

        // 4. Crear el Client (Datos de negocio) vinculado por UserId
        var client = new Client
        {
            DocumentNumber = dto.DocumentNumber?.Trim() ?? string.Empty,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Phone = dto.Phone.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            EnterpriseId = dto.EnterpriseId,
            UserId = user.Id
        };

        await context.Clients.AddAsync(client, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return new ClientResponseDto(
            client.Id,
            client.DocumentNumber,
            client.FirstName,
            client.LastName,
            user.Email!,
            client.Phone,
            client.IsActive,
            client.CreatedAt,
            client.EnterpriseId
        );
    }

    public async Task<bool> UpdateAsync(int id, UpdateClientRequestDto dto, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(dto);

        var client = await context.Clients
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (client is null)
        {
            return false;
        }

        if (!string.IsNullOrWhiteSpace(dto.DocumentNumber))
        {
            var cleanDoc = dto.DocumentNumber.Trim();
            var docExists = await context.Clients.AnyAsync(
                c => c.Id != id && c.EnterpriseId == client.EnterpriseId && c.DocumentNumber == cleanDoc,
                cancellationToken);

            if (docExists)
            {
                throw new InvalidOperationException($"Ya existe un cliente con el documento '{cleanDoc}' registrado en la empresa.");
            }

            client.DocumentNumber = cleanDoc;
        }

        client.FirstName = dto.FirstName.Trim();
        client.LastName = dto.LastName.Trim();
        client.Phone = dto.Phone.Trim();
        
        if (client.IsActive != dto.IsActive)
        {
            client.IsActive = dto.IsActive;
            
            if (client.User is not null)
            {
                if (!client.IsActive)
                {
                    await userManager.SetLockoutEndDateAsync(client.User, DateTimeOffset.MaxValue);
                }
                else
                {
                    await userManager.SetLockoutEndDateAsync(client.User, null);
                }
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var client = await context.Clients
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (client is null)
        {
            return false;
        }

        client.IsActive = false;
        
        if (client.User is not null)
        {
            await userManager.SetLockoutEndDateAsync(client.User, DateTimeOffset.MaxValue);
        }

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
