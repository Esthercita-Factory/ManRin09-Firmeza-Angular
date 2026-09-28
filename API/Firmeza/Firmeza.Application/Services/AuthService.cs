using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Interfaces;

namespace Firmeza.Application.Services;

public class AuthService : IAuthService
{
    private readonly IEnterpriseRepository _enterpriseRepository;
    private readonly IClientRepository _clientRepository;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        IEnterpriseRepository enterpriseRepository,
        IClientRepository clientRepository,
        IPasswordHasher passwordHasher)
    {
        _enterpriseRepository = enterpriseRepository;
        _clientRepository = clientRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task RegisterEnterpriseAsync(
        string businessName,
        string taxId,
        string contactName,
        string corporateEmail,
        string corporatePhone,
        string password)
    {
        if (await _enterpriseRepository.ExistsByTaxIdAsync(taxId))
        {
            throw new InvalidOperationException($"Ya existe una empresa registrada con el NIT/TaxId '{taxId}'.");
        }

        if (await _enterpriseRepository.ExistsByEmailAsync(corporateEmail))
        {
            throw new InvalidOperationException($"Ya existe una empresa registrada con el correo corporativo '{corporateEmail}'.");
        }

        var enterprise = new Enterprise
        {
            BusinessName = businessName,
            TaxId = taxId,
            ContactName = contactName,
            CorporateEmail = corporateEmail,
            CorporatePhone = corporatePhone,
            PasswordHash = _passwordHasher.HashPassword(password),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _enterpriseRepository.AddAsync(enterprise);
    }

    public async Task RegisterClientAsync(
        string firstName,
        string lastName,
        string email,
        string phone,
        string password)
    {
        if (await _clientRepository.ExistsByEmailAsync(email))
        {
            throw new InvalidOperationException($"Ya existe un cliente registrado con el correo electrónico '{email}'.");
        }

        var client = new Client
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            PasswordHash = _passwordHasher.HashPassword(password),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _clientRepository.AddAsync(client);
    }

    public async Task<AuthResultDto> LoginAsync(string email, string password)
    {
        // 1. Buscar primero en Enterprises por CorporateEmail
        var enterprise = await _enterpriseRepository.GetByEmailAsync(email);
        if (enterprise != null)
        {
            if (_passwordHasher.VerifyPassword(password, enterprise.PasswordHash))
            {
                return new AuthResultDto(
                    userId: enterprise.Id,
                    email: enterprise.CorporateEmail,
                    name: enterprise.BusinessName,
                    role: "Enterprise",
                    success: true,
                    errorMessage: null
                );
            }

            return new AuthResultDto(
                userId: 0,
                email: email,
                name: string.Empty,
                role: string.Empty,
                success: false,
                errorMessage: "Credenciales inválidas."
            );
        }

        // 2. Si no existe empresa con ese correo, buscar en Clients por Email
        var client = await _clientRepository.GetByEmailAsync(email);
        if (client != null)
        {
            if (_passwordHasher.VerifyPassword(password, client.PasswordHash))
            {
                var fullName = $"{client.FirstName} {client.LastName}".Trim();

                return new AuthResultDto(
                    userId: client.Id,
                    email: client.Email,
                    name: fullName,
                    role: "Client",
                    success: true,
                    errorMessage: null
                );
            }

            return new AuthResultDto(
                userId: 0,
                email: email,
                name: string.Empty,
                role: string.Empty,
                success: false,
                errorMessage: "Credenciales inválidas."
            );
        }

        // 3. Si no coincide en ninguno
        return new AuthResultDto(
            userId: 0,
            email: email,
            name: string.Empty,
            role: string.Empty,
            success: false,
            errorMessage: "Credenciales inválidas."
        );
    }
}
