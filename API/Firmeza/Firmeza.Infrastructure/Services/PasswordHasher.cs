using Firmeza.Application.Interfaces;
using BC = BCrypt.Net.BCrypt;

namespace Firmeza.Infrastructure.Services;

/// <summary>
/// Implementación de IPasswordHasher utilizando el algoritmo seguro BCrypt.
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        return BC.HashPassword(password);
    }

    public bool Verify(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        try
        {
            return BC.Verify(password, passwordHash);
        }
        catch
        {
            return false;
        }
    }
}
