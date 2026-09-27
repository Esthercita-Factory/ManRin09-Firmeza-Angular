using Microsoft.AspNetCore.Mvc;

namespace Firmeza.web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpGet("home-data")]
    public IActionResult GetHomeData()
    {
        return Ok(new
        {
            mensaje = "Conexión exitosa desde el backend Firmeza API",
            fecha = DateTime.UtcNow,
            estado = "Servidor Activo"
        });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginTestRequest request)
    {
        if (request.Email == "test@firmeza.com" && request.Password == "123456")
        {
            return Ok(new { token = "token_de_prueba_jwt_12345", usuario = request.Email });
        }

        return Unauthorized(new { mensaje = "Credenciales incorrectas (Usa: test@firmeza.com / 123456)" });
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterTestRequest request)
    {
        return Ok(new { mensaje = $"Usuario {request.Nombre} registrado correctamente con email {request.Email}" });
    }
}

public record LoginTestRequest(string Email, string Password);
public record RegisterTestRequest(string Nombre, string Email, string Password);
