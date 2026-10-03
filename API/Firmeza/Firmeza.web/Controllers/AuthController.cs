using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Endpoint unificado de registro consumido por el frontend Angular (/api/auth/register).
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error al procesar el registro.", details = ex.Message });
        }
    }

    [HttpPost("register/enterprise")]
    public async Task<IActionResult> RegisterEnterprise([FromBody] RegisterEnterpriseDto request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterEnterpriseAsync(
                request.BusinessName,
                request.TaxId,
                request.ContactName,
                request.CorporateEmail,
                request.CorporatePhone,
                request.Password,
                cancellationToken);

            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("register/client")]
    public async Task<IActionResult> RegisterClient([FromBody] RegisterClientDto request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterClientAsync(
                request.FirstName,
                request.LastName,
                request.Email,
                request.Phone,
                request.Password,
                cancellationToken);

            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
