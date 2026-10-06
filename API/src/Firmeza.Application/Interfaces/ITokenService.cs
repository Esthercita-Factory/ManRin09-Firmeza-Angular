namespace Firmeza.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(int userId, string email, string role, string fullName);
}
