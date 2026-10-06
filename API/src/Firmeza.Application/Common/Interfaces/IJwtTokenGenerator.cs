namespace Firmeza.Application.Common.Interfaces;

/// <summary>
/// Contrato para la generación de tokens JWT siguiendo el Principio de Inversión de Dependencias (DIP).
/// La implementación técnica se delega a la capa de Infraestructura.
/// </summary>
public interface IJwtTokenGenerator
{
    string GenerateToken(string userId, string email, string role);
}
