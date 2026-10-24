using System.Security.Claims;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Api.Controllers;

/// <summary>
/// Controlador para la gestión de proveedores (CRUD).
/// Exclusivo para administradores y cuenta de empresa (AC-AUTH-02).
/// </summary>
[Authorize(Roles = "Enterprise,Administrator")]
[ApiController]
[Route("api/[controller]")]
public class SuppliersController(
    ISupplierService supplierService,
    IEnterpriseRepository enterpriseRepository) : ControllerBase
{
    private async Task<int?> ResolveEnterpriseIdAsync()
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        var enterprise = await enterpriseRepository.GetByEmailAsync(email);
        return enterprise?.Id;
    }

    /// <summary>
    /// Obtiene el catálogo de proveedores de la ferretería.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SupplierResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var enterpriseId = await ResolveEnterpriseIdAsync();
        var suppliers = await supplierService.GetAllAsync(enterpriseId, ct);
        return Ok(suppliers);
    }

    /// <summary>
    /// Obtiene los datos de un proveedor específico por su identificador.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var supplier = await supplierService.GetByIdAsync(id, ct);
        if (supplier is null)
        {
            return NotFound(new { message = $"No se encontró el proveedor con ID {id}." });
        }

        return Ok(supplier);
    }

    /// <summary>
    /// Registra un nuevo proveedor en el sistema.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateSupplierRequestDto request,
        CancellationToken ct)
    {
        var enterpriseId = await ResolveEnterpriseIdAsync();
        var supplier = await supplierService.CreateAsync(request, enterpriseId, ct);
        return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
    }

    /// <summary>
    /// Actualiza los datos de un proveedor existente.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(SupplierResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateSupplierRequestDto request,
        CancellationToken ct)
    {
        var supplier = await supplierService.UpdateAsync(id, request, ct);
        if (supplier is null)
        {
            return NotFound(new { message = $"No se encontró el proveedor con ID {id}." });
        }

        return Ok(supplier);
    }

    /// <summary>
    /// Desactiva (baja lógica) a un proveedor.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await supplierService.DeleteAsync(id, ct);
        if (!deleted)
        {
            return NotFound(new { message = $"No se encontró el proveedor con ID {id}." });
        }

        return NoContent();
    }
}
