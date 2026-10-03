using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

/// <summary>
/// Contrato de servicio para operaciones de autenticación y registro.
/// </summary>
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthResponseDto> RegisterEnterpriseAsync(
        string businessName,
        string taxId,
        string contactName,
        string corporateEmail,
        string corporatePhone,
        string password,
        CancellationToken cancellationToken = default);

    Task<AuthResponseDto> RegisterClientAsync(
        string firstName,
        string lastName,
        string email,
        string phone,
        string password,
        CancellationToken cancellationToken = default);

    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
}
