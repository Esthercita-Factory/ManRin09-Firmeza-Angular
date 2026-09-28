using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

public interface IAuthService
{
    Task RegisterEnterpriseAsync(string businessName, string taxId, string contactName, string corporateEmail, string corporatePhone, string password);
    Task RegisterClientAsync(string firstName, string lastName, string email, string phone, string password);
    Task<AuthResultDto> LoginAsync(string email, string password);
}
