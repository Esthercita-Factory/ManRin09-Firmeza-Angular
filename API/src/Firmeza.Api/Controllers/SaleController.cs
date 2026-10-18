using System.Security.Claims;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Api.Controllers;

/// <summary>
/// Controlador API RESTful para la gestión y registro de ventas.
/// Protegido mediante JWT Bearer token para operaciones comerciales y auditoría.
/// Delega la lógica de negocio y transaccional a ISaleService.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SaleController(
    UserManager<ApplicationUser> userManager,
    IEmployeeRepository employeeRepository,
    ISaleService saleService) : ControllerBase
{
    private async Task<string> ResolveScheduledByNameAsync(CancellationToken cancellationToken)
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(email))
        {
            return "Administrador";
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
        {
            return !string.IsNullOrWhiteSpace(user.FullName)
                ? user.FullName
                : (user.Email ?? "Administrador");
        }

        // Si es un empleado autenticado ({documento}@firmeza.internal)
        var docNumber = email.Split('@')[0];
        var employee = await employeeRepository.GetByDocumentNumberAsync(docNumber, cancellationToken);
        if (employee is not null && !string.IsNullOrWhiteSpace(employee.FullName))
        {
            return employee.FullName;
        }

        if (int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var empId))
        {
            employee = await employeeRepository.GetByIdAsync(empId, cancellationToken);
            if (employee is not null && !string.IsNullOrWhiteSpace(employee.FullName))
            {
                return employee.FullName;
            }
        }

        return email;
    }

    /// <summary>
    /// Obtiene el listado completo de ventas registradas en el sistema junto a sus productos.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SaleResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var sales = await saleService.GetAllAsync(cancellationToken);
        return Ok(sales);
    }

    /// <summary>
    /// Obtiene una venta específica por su identificador único junto a su detalle.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SaleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var sale = await saleService.GetByIdAsync(id, cancellationToken);
        if (sale is null)
        {
            return NotFound(new { message = $"No se encontró la venta con ID {id}." });
        }

        return Ok(sale);
    }

    /// <summary>
    /// Obtiene el historial de ventas asociadas a un cliente específico.
    /// </summary>
    [HttpGet("client/{clientId:int}")]
    [ProducesResponseType(typeof(IEnumerable<SaleResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByClientId(int clientId, CancellationToken cancellationToken)
    {
        var sales = await saleService.GetByClientIdAsync(clientId, cancellationToken);
        return Ok(sales);
    }

    /// <summary>
    /// Registra una nueva venta con deducción atómica de inventario y alertas dinámicas de stock.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SaleResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create(
        [FromBody] CreateSaleRequestDto request,
        CancellationToken cancellationToken)
    {
        var scheduledByName = await ResolveScheduledByNameAsync(cancellationToken);
        var sale = await saleService.CreateAsync(request, scheduledByName, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = sale.Id }, sale);
    }

    /// <summary>
    /// Actualiza los datos o estado general de una venta existente.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(SaleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateSaleRequestDto request,
        CancellationToken cancellationToken)
    {
        var sale = await saleService.UpdateAsync(id, request, cancellationToken);
        if (sale is null)
        {
            return NotFound(new { message = $"No se encontró la venta con ID {id}." });
        }

        return Ok(sale);
    }

    /// <summary>
    /// Alterna el estado de pago de una venta (marcar como pagada o pendiente).
    /// </summary>
    [HttpPatch("{id:int}/toggle-paid")]
    [ProducesResponseType(typeof(SaleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TogglePaid(int id, CancellationToken cancellationToken)
    {
        var sale = await saleService.TogglePaidAsync(id, cancellationToken);
        if (sale is null)
        {
            return NotFound(new { message = $"No se encontró la venta con ID {id}." });
        }

        return Ok(sale);
    }

    /// <summary>
    /// Elimina un registro de venta revirtiendo automáticamente el stock al inventario.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await saleService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = $"No se encontró la venta con ID {id}." });
        }

        return NoContent();
    }
}
