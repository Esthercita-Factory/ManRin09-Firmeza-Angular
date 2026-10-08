using System.Security.Claims;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.web.Controllers;

/// <summary>
/// Controlador protegido para el suministro de datos consolidados del Dashboard.
/// Requiere autenticación mediante JWT Bearer token.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController(
    UserManager<ApplicationUser> userManager,
    IEnterpriseRepository enterpriseRepository,
    IClientRepository clientRepository) : ControllerBase
{
    /// <summary>
    /// Retorna los datos y métricas iniciales del usuario o empresa autenticada.
    /// </summary>
    [HttpGet]
    [HttpGet("summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDashboardData(CancellationToken cancellationToken)
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new { message = "No fue posible determinar la identidad del usuario a partir del token." });
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return NotFound(new { message = "Usuario no encontrado en la base de datos." });
        }

        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Client";

        if (primaryRole.Equals("Enterprise", StringComparison.OrdinalIgnoreCase))
        {
            var enterprise = await enterpriseRepository.GetByEmailAsync(email);

            return Ok(new
            {
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName ?? enterprise?.BusinessName ?? "Organización Firmeza",
                    role = primaryRole,
                    createdAt = user.CreatedAt
                },
                accountType = "empresa",
                company = enterprise is null ? null : new
                {
                    id = enterprise.Id,
                    businessName = enterprise.BusinessName,
                    taxId = enterprise.TaxId,
                    contactName = enterprise.ContactName,
                    corporateEmail = enterprise.CorporateEmail,
                    corporatePhone = enterprise.CorporatePhone,
                    isActive = enterprise.IsActive,
                    totalClients = enterprise.Clients?.Count ?? 0
                },
                metrics = new
                {
                    totalClients = enterprise?.Clients?.Count ?? 0,
                    activeWarehouses = 1,
                    totalProducts = 0,
                    storageCapacity = "85% disponible",
                    systemStatus = "Operacional",
                    lastSync = DateTime.UtcNow
                },
                message = $"Bienvenido al panel corporativo, {enterprise?.BusinessName ?? user.FullName}."
            });
        }
        else
        {
            var client = await clientRepository.GetByEmailAsync(email);

            return Ok(new
            {
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName ?? $"{client?.FirstName} {client?.LastName}".Trim(),
                    role = primaryRole,
                    createdAt = user.CreatedAt
                },
                accountType = "persona",
                client = client is null ? null : new
                {
                    id = client.Id,
                    firstName = client.FirstName,
                    lastName = client.LastName,
                    email = client.Email,
                    phone = client.Phone,
                    isActive = client.IsActive
                },
                metrics = new
                {
                    assignedOrders = 0,
                    pendingDeliveries = 0,
                    systemStatus = "Activo",
                    notifications = 0,
                    lastSync = DateTime.UtcNow
                },
                message = $"Bienvenido a Firmeza, {user.FullName ?? client?.FirstName}."
            });
        }
    }
}
