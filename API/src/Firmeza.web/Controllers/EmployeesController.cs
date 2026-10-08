using System.Security.Claims;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Entities.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.web.Controllers;

/// <summary>
/// Controlador API RESTful para la gestión de empleados.
/// Restringido exclusivamente a usuarios autenticados con rol "Enterprise" (Empresa).
/// </summary>
[Authorize(Roles = "Enterprise")]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController(
    UserManager<ApplicationUser> userManager,
    IEnterpriseRepository enterpriseRepository,
    IEmployeeRepository employeeRepository) : ControllerBase
{
    /// <summary>
    /// Obtiene la lista de empleados pertenecientes a la empresa autenticada.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EmployeeResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var enterprise = await GetCurrentEnterpriseAsync();
        if (enterprise is null)
        {
            return Unauthorized(new { message = "Solo una empresa registrada puede consultar sus empleados." });
        }

        var employees = await employeeRepository.GetByEnterpriseIdAsync(enterprise.Id, cancellationToken);
        var response = employees.Select(e => new EmployeeResponseDto(
            e.Id,
            e.DocumentNumber,
            e.FullName,
            e.Phone,
            e.Role,
            e.IsActive,
            e.CreatedAt,
            e.EnterpriseId
        ));

        return Ok(response);
    }

    /// <summary>
    /// Obtiene un empleado por su identificador único dentro de la empresa autenticada.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var enterprise = await GetCurrentEnterpriseAsync();
        if (enterprise is null)
        {
            return Unauthorized(new { message = "Solo una empresa registrada puede consultar sus empleados." });
        }

        var employee = await employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee is null || employee.EnterpriseId != enterprise.Id)
        {
            return NotFound(new { message = $"Empleado con ID {id} no encontrado en su organización." });
        }

        return Ok(new EmployeeResponseDto(
            employee.Id,
            employee.DocumentNumber,
            employee.FullName,
            employee.Phone,
            employee.Role,
            employee.IsActive,
            employee.CreatedAt,
            employee.EnterpriseId
        ));
    }

    /// <summary>
    /// Registra un nuevo empleado para la empresa autenticada.
    /// Valida que el documento de identificación sea único en el sistema.
    /// Permite asignar roles estándar o personalizados.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var enterprise = await GetCurrentEnterpriseAsync();
        if (enterprise is null)
        {
            return Unauthorized(new { message = "Solo las cuentas tipo Empresa pueden dar de alta a nuevos empleados." });
        }

        var cleanDocument = request.DocumentNumber.Trim();
        if (await employeeRepository.ExistsByDocumentNumberAsync(cleanDocument, cancellationToken))
        {
            return BadRequest(new { message = $"El documento de identidad '{cleanDocument}' ya se encuentra registrado por otro colaborador." });
        }

        var employee = new Employee
        {
            DocumentNumber = cleanDocument,
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim() ?? string.Empty,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Operador" : request.Role.Trim(),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            EnterpriseId = enterprise.Id
        };

        await employeeRepository.AddAsync(employee, cancellationToken);

        var response = new EmployeeResponseDto(
            employee.Id,
            employee.DocumentNumber,
            employee.FullName,
            employee.Phone,
            employee.Role,
            employee.IsActive,
            employee.CreatedAt,
            employee.EnterpriseId
        );

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, response);
    }

    /// <summary>
    /// Actualiza los datos de un empleado de la empresa autenticada.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequestDto request, CancellationToken cancellationToken)
    {
        var enterprise = await GetCurrentEnterpriseAsync();
        if (enterprise is null)
        {
            return Unauthorized(new { message = "Solo una empresa puede modificar a sus empleados." });
        }

        var employee = await employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee is null || employee.EnterpriseId != enterprise.Id)
        {
            return NotFound(new { message = $"Empleado con ID {id} no encontrado en su organización." });
        }

        employee.FullName = request.FullName.Trim();
        employee.Phone = request.Phone?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            employee.Role = request.Role.Trim();
        }
        employee.IsActive = request.IsActive;

        await employeeRepository.UpdateAsync(employee, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Elimina a un empleado de la empresa autenticada.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var enterprise = await GetCurrentEnterpriseAsync();
        if (enterprise is null)
        {
            return Unauthorized(new { message = "Solo una empresa puede eliminar a sus empleados." });
        }

        var employee = await employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee is null || employee.EnterpriseId != enterprise.Id)
        {
            return NotFound(new { message = $"Empleado con ID {id} no encontrado." });
        }

        await employeeRepository.DeleteAsync(employee, cancellationToken);
        return NoContent();
    }

    private async Task<Enterprise?> GetCurrentEnterpriseAsync()
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(email)) return null;

        var user = await userManager.FindByEmailAsync(email);
        if (user is null) return null;

        return await enterpriseRepository.GetByEmailAsync(email);
    }
}
