namespace Firmeza.Application.Interfaces;

/// <summary>
/// Abstracción para el hashing y verificación segura de contraseñas.
/// </summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);

    // Métodos para compatibilidad hacia atrás
    string HashPassword(string password) => Hash(password);
    bool VerifyPassword(string password, string hashedPassword) => Verify(password, hashedPassword);
}
