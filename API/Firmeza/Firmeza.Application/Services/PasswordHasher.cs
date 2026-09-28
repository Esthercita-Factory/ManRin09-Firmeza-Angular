using System.Security.Cryptography;
using Firmeza.Application.Interfaces;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace Firmeza.Application.Services;

public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16; // 128 bits
    private const int HashSize = 32; // 256 bits
    private const int IterationCount = 100_000; // Recomendación OWASP para PBKDF2 con HMAC-SHA256

    public string HashPassword(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

        byte[] subKey = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: IterationCount,
            numBytesRequested: HashSize);

        return $"{IterationCount}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(subKey)}";
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hashedPassword))
        {
            return false;
        }

        string[] parts = hashedPassword.Split('.', 3);
        if (parts.Length != 3)
        {
            return false;
        }

        if (!int.TryParse(parts[0], out int iterations) || iterations <= 0)
        {
            return false;
        }

        byte[] salt;
        byte[] expectedSubKey;

        try
        {
            salt = Convert.FromBase64String(parts[1]);
            expectedSubKey = Convert.FromBase64String(parts[2]);
        }
        catch (FormatException)
        {
            return false;
        }

        if (salt.Length == 0 || expectedSubKey.Length == 0)
        {
            return false;
        }

        byte[] actualSubKey = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: iterations,
            numBytesRequested: expectedSubKey.Length);

        return CryptographicOperations.FixedTimeEquals(actualSubKey, expectedSubKey);
    }
}
