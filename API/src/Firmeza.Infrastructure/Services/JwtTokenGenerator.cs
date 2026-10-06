using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Firmeza.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Firmeza.Infrastructure.Services;

/// <summary>
/// Implementación de la generación de tokens JWT para la autenticación de usuarios.
/// Lee los parámetros de configuración y firma digitalmente el token con HMAC-SHA256.
/// </summary>
public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(string userId, string email, string role)
    {
        var secretKey = _configuration["Jwt:SecretKey"]
            ?? _configuration["JwtSettings:SecretKey"]
            ?? throw new InvalidOperationException("La clave secreta 'Jwt:SecretKey' no se encuentra configurada en appsettings.");

        var issuer = _configuration["Jwt:Issuer"] ?? _configuration["JwtSettings:Issuer"] ?? "FirmezaAPI";
        var audience = _configuration["Jwt:Audience"] ?? _configuration["JwtSettings:Audience"] ?? "FirmezaApp";

        var expirationHoursRaw = _configuration["Jwt:ExpirationHours"];
        var expirationHours = int.TryParse(expirationHoursRaw, out var hours) ? hours : 8;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(expirationHours),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = signingCredentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
