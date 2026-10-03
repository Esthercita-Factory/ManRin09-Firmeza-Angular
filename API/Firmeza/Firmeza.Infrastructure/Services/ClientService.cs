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
/// Utiliza constructores primarios de C# 14.
/// </summary>
public class ClientService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager) : IClientService
{
    public async Task<IEnumerable<ClientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Clients
            .AsNoTracking()
            .Include(c => c.User) // Cargar la cuenta de Identity relacionada
            .Select(c => new ClientResponseDto(
                c.Id,
                c.FirstName,
                c.LastName,
                c.User.Email!, // Mapear el correo desde Identity
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
            .Include(c => c.User) // Cargar la cuenta de Identity relacionada
            .Where(c => c.Id == id)
            .Select(c => new ClientResponseDto(
                c.Id,
                c.FirstName,
                c.LastName,
                c.User.Email!, // Mapear el correo desde Identity
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

        // 2. Crear el ApplicationUser (Identidad)
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

        // Asignar rol (consistente con el AuthService)
        await userManager.AddToRoleAsync(user, "Client");

        // 3. Crear el Client (Datos de negocio) vinculado por UserId
        var client = new Client
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.Phone,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            EnterpriseId = dto.EnterpriseId,
            UserId = user.Id // Relación 1 a 1
        };

        await context.Clients.AddAsync(client, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return new ClientResponseDto(
            client.Id,
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

        // Se incluye User en caso de que queramos manipular su estado en Identity
        var client = await context.Clients
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (client is null)
        {
            return false;
        }

        // Actualizar propiedades exclusivamente del negocio
        client.FirstName = dto.FirstName;
        client.LastName = dto.LastName;
        client.Phone = dto.Phone;
        
        // Manejar el borrado/desactivación lógico
        if (client.IsActive != dto.IsActive)
        {
            client.IsActive = dto.IsActive;
            
            // Reflejar la desactivación bloqueando temporalmente la cuenta en Identity
            if (!client.IsActive)
            {
                await userManager.SetLockoutEndDateAsync(client.User, DateTimeOffset.MaxValue);
            }
            else
            {
                await userManager.SetLockoutEndDateAsync(client.User, null);
            }
        }

        // Nota: Si el flujo y el DTO permitieran actualizar el Email o la Contraseña, 
        // aquí se delegaría a Identity usando:
        // await userManager.SetEmailAsync(client.User, dto.NuevoEmail);
        // await userManager.SetUserNameAsync(client.User, dto.NuevoEmail);

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

        // Borrado lógico para preservar integridad histórica en tablas de negocio.
        // Si quisieras un borrado físico, usarías: context.Clients.Remove(client); await userManager.DeleteAsync(client.User);
        client.IsActive = false;
        
        // Bloquear permanentemente la cuenta en Identity para impedir login futuro
        await userManager.SetLockoutEndDateAsync(client.User, DateTimeOffset.MaxValue);

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
