using Firmeza.Application.Common.Interfaces;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Entities.Identity;
using Microsoft.AspNetCore.Identity;

namespace Firmeza.Application.Services;

/// <summary>
/// Servicio de autenticación y registro con constructor primario de C# (.NET 10).
/// Gestiona la sincronización segura entre Identity y las entidades de dominio Enterprise y Client.
/// </summary>
public class AuthService(
    UserManager<ApplicationUser> userManager,
    IJwtTokenGenerator jwtTokenGenerator,
    IClientRepository clientRepository,
    IEnterpriseRepository enterpriseRepository,
    IPasswordHasher passwordHasher) : IAuthService
{
    /// <summary>
    /// Procesador unificado para solicitudes de registro enviadas desde el cliente Angular.
    /// Mapea de forma segura los campos evitando valores nulos en propiedades requeridas.
    /// </summary>
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var isEnterprise = string.Equals(request.AccountType, "empresa", StringComparison.OrdinalIgnoreCase);

        if (isEnterprise)
        {
            // Resolver Razón Social / Nombre de la Empresa
            var businessName = !string.IsNullOrWhiteSpace(request.CompanyName)
                ? request.CompanyName.Trim()
                : (request.BusinessName?.Trim() ?? string.Empty);

            if (string.IsNullOrWhiteSpace(businessName))
            {
                throw new InvalidOperationException("La razón social o nombre de la empresa es obligatorio.");
            }

            // Resolver Identificador Fiscal (NIT / RFC / TaxId)
            var taxId = request.TaxId?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(taxId))
            {
                throw new InvalidOperationException("El identificador fiscal (TaxId / NIT / RFC) es obligatorio.");
            }

            // Resolver Persona de Contacto
            var contactName = !string.IsNullOrWhiteSpace(request.Name)
                ? request.Name.Trim()
                : (!string.IsNullOrWhiteSpace(request.FirstName)
                    ? $"{request.FirstName} {request.LastName}".Trim()
                    : businessName);

            return await RegisterEnterpriseAsync(
                businessName: businessName,
                taxId: taxId,
                contactName: contactName,
                corporateEmail: request.Email?.Trim() ?? string.Empty,
                corporatePhone: request.Phone?.Trim() ?? string.Empty,
                password: request.Password,
                cancellationToken: cancellationToken);
        }
        else
        {
            // Resolver Nombre y Apellido para Persona Natural
            var firstName = request.FirstName?.Trim() ?? string.Empty;
            var lastName = request.LastName?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(firstName) && !string.IsNullOrWhiteSpace(request.Name))
            {
                var parts = request.Name.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                firstName = parts[0];
                lastName = parts.Length > 1 ? parts[1] : string.Empty;
            }

            if (string.IsNullOrWhiteSpace(firstName))
            {
                throw new InvalidOperationException("El nombre del cliente es obligatorio.");
            }

            // Evitar null en columnas NOT NULL de BD
            if (string.IsNullOrWhiteSpace(lastName))
            {
                lastName = firstName;
            }

            return await RegisterClientAsync(
                firstName: firstName,
                lastName: lastName,
                email: request.Email?.Trim() ?? string.Empty,
                phone: request.Phone?.Trim() ?? string.Empty,
                password: request.Password,
                cancellationToken: cancellationToken);
        }
    }

    public async Task<AuthResponseDto> RegisterEnterpriseAsync(
        string businessName,
        string taxId,
        string contactName,
        string corporateEmail,
        string corporatePhone,
        string password,
        CancellationToken cancellationToken = default)
    {
        var cleanEmail = corporateEmail.Trim().ToLowerInvariant();
        var cleanTaxId = taxId.Trim();

        // 1. Validaciones previas de unicidad
        if (await enterpriseRepository.ExistsByEmailAsync(cleanEmail) ||
            await userManager.FindByEmailAsync(cleanEmail) != null)
        {
            throw new InvalidOperationException($"El correo '{corporateEmail}' ya se encuentra registrado.");
        }

        if (await enterpriseRepository.ExistsByTaxIdAsync(cleanTaxId))
        {
            throw new InvalidOperationException($"La identificación fiscal (NIT/RFC) '{taxId}' ya está registrada.");
        }

        // 2. Instanciar y crear ApplicationUser en Identity
        var user = new ApplicationUser
        {
            UserName = cleanEmail,
            Email = cleanEmail,
            FullName = businessName.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Error al registrar la empresa: {errors}");
        }

        // 3. Asignar rol corporativo
        await userManager.AddToRoleAsync(user, "Enterprise");

        // 4. Instanciar y persistir entidad de dominio Enterprise
        var enterprise = new Enterprise
        {
            BusinessName = businessName.Trim(),
            TaxId = cleanTaxId,
            ContactName = contactName.Trim(),
            CorporateEmail = cleanEmail,
            CorporatePhone = corporatePhone.Trim(),
            PasswordHash = user.PasswordHash ?? passwordHasher.Hash(password),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            UserId = user.Id
        };

        await enterpriseRepository.AddAsync(enterprise);

        // 5. Generar token de autenticación
        var token = jwtTokenGenerator.GenerateToken(user.Id, user.Email!, "Enterprise");
        var expiration = DateTime.UtcNow.AddHours(8);

        return new AuthResponseDto(
            Token: token,
            UserId: user.Id,
            Email: user.Email!,
            Role: "Enterprise",
            FullName: enterprise.BusinessName,
            Expiration: expiration,
            AccountType: "empresa",
            Message: "Empresa registrada exitosamente."
        );
    }

    public async Task<AuthResponseDto> RegisterClientAsync(
        string firstName,
        string lastName,
        string email,
        string phone,
        string password,
        CancellationToken cancellationToken = default)
    {
        var cleanEmail = email.Trim().ToLowerInvariant();

        // 1. Validaciones previas de unicidad
        if (await clientRepository.ExistsByEmailAsync(cleanEmail) ||
            await userManager.FindByEmailAsync(cleanEmail) != null)
        {
            throw new InvalidOperationException($"El correo '{email}' ya se encuentra registrado.");
        }

        var fullName = $"{firstName.Trim()} {lastName.Trim()}".Trim();

        // 2. Instanciar y crear ApplicationUser en Identity
        var user = new ApplicationUser
        {
            UserName = cleanEmail,
            Email = cleanEmail,
            FullName = fullName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Error al registrar el cliente: {errors}");
        }

        // 3. Asignar rol de cliente
        await userManager.AddToRoleAsync(user, "Client");

        // 4. Instanciar y persistir entidad de dominio Client
        var client = new Client
        {
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Email = cleanEmail,
            Phone = phone.Trim(),
            PasswordHash = user.PasswordHash ?? passwordHasher.Hash(password),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            UserId = user.Id
        };

        await clientRepository.AddAsync(client);

        // 5. Generar token de autenticación
        var token = jwtTokenGenerator.GenerateToken(user.Id, user.Email!, "Client");
        var expiration = DateTime.UtcNow.AddHours(8);

        return new AuthResponseDto(
            Token: token,
            UserId: user.Id,
            Email: user.Email!,
            Role: "Client",
            FullName: fullName,
            Expiration: expiration,
            AccountType: "persona",
            Message: "Cliente registrado exitosamente."
        );
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var cleanEmail = request.Email.Trim().ToLowerInvariant();

        // 1. Buscar usuario en Identity
        var user = await userManager.FindByEmailAsync(cleanEmail);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        // 2. Validar contraseña
        var isValidPassword = await userManager.CheckPasswordAsync(user, request.Password);
        if (!isValidPassword)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        // 3. Obtener roles para el token JWT
        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Client";

        // 4. Generar token
        var token = jwtTokenGenerator.GenerateToken(user.Id, user.Email!, primaryRole);
        var expiration = DateTime.UtcNow.AddHours(8);
        var accountType = primaryRole.Equals("Enterprise", StringComparison.OrdinalIgnoreCase) ? "empresa" : "persona";

        return new AuthResponseDto(
            Token: token,
            UserId: user.Id,
            Email: user.Email!,
            Role: primaryRole,
            FullName: user.FullName ?? user.Email!,
            Expiration: expiration,
            AccountType: accountType,
            Message: "Inicio de sesión exitoso."
        );
    }
}
