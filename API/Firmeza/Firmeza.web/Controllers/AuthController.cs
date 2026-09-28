using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ITokenService _tokenService;

    public AuthController(IAuthService authService, ITokenService tokenService)
    {
        _authService = authService;
        _tokenService = tokenService;
    }

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
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password);

        if (!result.Success)
        {
            return Unauthorized(new { message = result.ErrorMessage ?? "Credenciales inválidas." });
        }

        var token = _tokenService.GenerateToken(result.UserId, result.Email, result.Role, result.Name);

        return Ok(new
        {
            token,
            id = result.UserId,
            email = result.Email,
            name = result.Name,
            role = result.Role,
            user = new
            {
                id = result.UserId,
                email = result.Email,
                name = result.Name,
                role = result.Role
            }
        });
    }

    [HttpPost("register/enterprise")]
    public async Task<IActionResult> RegisterEnterprise([FromBody] RegisterEnterpriseDto request)
    {
        try
        {
            await _authService.RegisterEnterpriseAsync(
                request.BusinessName,
                request.TaxId,
                request.ContactName,
                request.CorporateEmail,
                request.CorporatePhone,
                request.Password);

            return StatusCode(StatusCodes.Status201Created, new { message = "Empresa registrada exitosamente." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("register/client")]
    public async Task<IActionResult> RegisterClient([FromBody] RegisterClientDto request)
    {
        try
        {
            await _authService.RegisterClientAsync(
                request.FirstName,
                request.LastName,
                request.Email,
                request.Phone,
                request.Password);

            return StatusCode(StatusCodes.Status201Created, new { message = "Cliente registrado exitosamente." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
