using System.Security.Claims;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Api.Controllers;

/// <summary>
/// Controlador para el módulo de compras, abastecimiento y recepción de materiales.
/// Exclusivo para administradores y cuenta empresa (AC-AUTH-02, AC-PUR-01, AC-PUR-02).
/// </summary>
[Authorize(Roles = "Enterprise,Administrator")]
[ApiController]
[Route("api/[controller]")]
public class PurchasesController(
    UserManager<ApplicationUser> userManager,
    IEmployeeRepository employeeRepository,
    IEnterpriseRepository enterpriseRepository,
    IPurchaseService purchaseService) : ControllerBase
{
    private async Task<(string Name, int? EnterpriseId)> ResolveReceiverAsync(CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(email))
        {
            return ("Administrador", null);
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
        {
            var enterprise = await enterpriseRepository.GetByEmailAsync(email);
            var name = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : (user.Email ?? "Administrador");
            return (name, enterprise?.Id);
        }

        var docNumber = email.Split('@')[0];
        var employee = await employeeRepository.GetByDocumentNumberAsync(docNumber, ct);
        if (employee is not null)
        {
            return (employee.FullName, employee.EnterpriseId);
        }

        if (int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var empId))
        {
            employee = await employeeRepository.GetByIdAsync(empId, ct);
            if (employee is not null)
            {
                return (employee.FullName, employee.EnterpriseId);
            }
        }

        return (email, null);
    }

    /// <summary>
    /// Obtiene el historial de órdenes de compra y recepción de mercancía.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PurchaseResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var (_, enterpriseId) = await ResolveReceiverAsync(ct);
        var purchases = await purchaseService.GetAllAsync(enterpriseId, ct);
        return Ok(purchases);
    }

    /// <summary>
    /// Obtiene una orden de compra específica con el detalle de los ítems recibidos.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PurchaseResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var purchase = await purchaseService.GetByIdAsync(id, ct);
        if (purchase is null)
        {
            return NotFound(new { message = $"No se encontró la compra con ID {id}." });
        }

        return Ok(purchase);
    }

    /// <summary>
    /// Obtiene todas las compras realizadas a un proveedor específico.
    /// </summary>
    [HttpGet("supplier/{supplierId:int}")]
    [ProducesResponseType(typeof(IEnumerable<PurchaseResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBySupplierId(int supplierId, CancellationToken ct)
    {
        var purchases = await purchaseService.GetBySupplierIdAsync(supplierId, ct);
        return Ok(purchases);
    }

    /// <summary>
    /// Registra una nueva compra o recepción de mercancía en inventario.
    /// Suma existencias automáticamente (AC-PUR-01) y calcula el Precio Medio Ponderado (PMP) de costo (AC-PUR-02).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PurchaseResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreatePurchaseRequestDto request,
        CancellationToken ct)
    {
        var (receiverName, enterpriseId) = await ResolveReceiverAsync(ct);
        var purchase = await purchaseService.CreateAsync(request, receiverName, enterpriseId, ct);
        return CreatedAtAction(nameof(GetById), new { id = purchase.Id }, purchase);
    }

    /// <summary>
    /// Cancela una orden de compra revirtiendo las existencias ingresadas al almacén.
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        var cancelled = await purchaseService.CancelAsync(id, ct);
        if (!cancelled)
        {
            return NotFound(new { message = $"No fue posible cancelar la compra #{id} o ya se encuentra cancelada." });
        }

        return Ok(new { message = $"La compra #{id} fue cancelada y sus existencias fueron revertidas del inventario." });
    }
}
