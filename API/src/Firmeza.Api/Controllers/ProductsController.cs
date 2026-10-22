using System.Security.Claims;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Domain.Entities.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Firmeza.Api.Controllers;

/// <summary>
/// Controlador para la gestión del inventario de productos (CRUD).
/// Protegido mediante JWT Bearer token para operaciones de escritura.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController(
    UserManager<ApplicationUser> userManager,
    IEmployeeRepository employeeRepository,
    IProductRepository productRepository,
    IEnterpriseRepository enterpriseRepository,
    IProductBulkImportService bulkImportService) : ControllerBase
{
    private async Task<string> ResolveRegisteredByNameAsync(Product p, CancellationToken cancellationToken)
    {
        if (p.RegisteredById.HasValue)
        {
            var guidStr = p.RegisteredById.Value.ToString();
            var user = await userManager.FindByIdAsync(guidStr);
            if (user is not null)
            {
                return !string.IsNullOrWhiteSpace(user.FullName)
                    ? user.FullName
                    : (user.Email ?? "Administrador");
            }

            var bytes = p.RegisteredById.Value.ToByteArray();
            var empId = BitConverter.ToInt32(bytes, 0);
            if (empId > 0)
            {
                var emp = await employeeRepository.GetByIdAsync(empId, cancellationToken);
                if (emp is not null && !string.IsNullOrWhiteSpace(emp.FullName))
                {
                    return emp.FullName;
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(p.LastMovement) && p.LastMovement != "Reciente")
        {
            return p.LastMovement;
        }

        return "Administrador";
    }

    private static ProductResponseDto MapToDto(Product p, string registeredByName) => new(
        p.Id,
        p.Sku,
        p.Barcode,
        p.Name,
        p.Description,
        p.Category,
        p.CategoryDetail,
        p.Location,
        p.CostPrice,
        p.Price,
        p.Stock,
        p.StockReserved,
        p.MinStock,
        p.IsActive,
        p.RegisteredById,
        registeredByName,
        p.EnterpriseId,
        p.Enterprise?.BusinessName ?? (!string.IsNullOrWhiteSpace(registeredByName) ? registeredByName : "Ferretería General"),
        p.CreatedAt,
        p.UpdatedAt
    );

    /// <summary>
    /// Obtiene el catálogo completo de productos (público para el e-commerce).
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<ProductResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var products = await productRepository.GetAllAsync(cancellationToken);
        var response = new List<ProductResponseDto>();

        foreach (var p in products)
        {
            var regName = await ResolveRegisteredByNameAsync(p, cancellationToken);
            response.Add(MapToDto(p, regName));
        }

        return Ok(response);
    }

    /// <summary>
    /// Obtiene un producto específico por su ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return NotFound(new { message = $"No se encontró el producto con ID {id}." });
        }

        var regName = await ResolveRegisteredByNameAsync(product, cancellationToken);
        return Ok(MapToDto(product, regName));
    }

    /// <summary>
    /// Registra un nuevo producto en el inventario identificando al usuario o empleado mediante su JWT.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductRequestDto request,
        CancellationToken cancellationToken)
    {
        // 1. Extraemos la identidad del usuario desde el token JWT
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new { message = "No fue posible determinar la identidad del usuario a partir del token." });
        }

        Guid registeredByGuid;
        string registeredByName;

        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
        {
            if (!Guid.TryParse(user.Id, out registeredByGuid))
            {
                registeredByGuid = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var subGuid)
                    ? subGuid
                    : Guid.NewGuid();
            }

            registeredByName = !string.IsNullOrWhiteSpace(user.FullName)
                ? user.FullName
                : (user.Email ?? "Administrador");
        }
        else
        {
            // Verificar si se trata de un Empleado autenticado ({documento}@firmeza.internal)
            var docNumber = email.Split('@')[0];
            var employee = await employeeRepository.GetByDocumentNumberAsync(docNumber, cancellationToken);

            if (employee is null && int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var empId))
            {
                employee = await employeeRepository.GetByIdAsync(empId, cancellationToken);
            }

            if (employee is null)
            {
                return Unauthorized(new { message = "El usuario asociado al token no existe en la base de datos." });
            }

            registeredByGuid = new Guid(employee.Id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            registeredByName = employee.FullName;
        }

        // Validamos si ya existe un producto con el mismo nombre
        if (await productRepository.ExistsByNameAsync(request.Name, cancellationToken))
        {
            return BadRequest(new { message = $"Ya existe un producto registrado con el nombre '{request.Name}'." });
        }

        // 2. Creamos la entidad de dominio
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = string.IsNullOrWhiteSpace(request.Sku) ? $"SKU-{Random.Shared.Next(1000, 9999)}" : request.Sku,
            Barcode = request.Barcode ?? string.Empty,
            Name = request.Name,
            Description = request.Description ?? string.Empty,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category,
            CategoryDetail = request.CategoryDetail ?? string.Empty,
            Location = request.Location,
            CostPrice = request.CostPrice,
            Price = request.Price,
            Stock = request.Stock,
            StockReserved = request.StockReserved,
            MinStock = request.MinStock,
            IsActive = true,
            RegisteredById = registeredByGuid,
            LastMovement = registeredByName,
            EnterpriseId = request.EnterpriseId,
            CreatedAt = DateTime.UtcNow
        };

        await productRepository.AddAsync(product, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToDto(product, registeredByName));
    }

    /// <summary>
    /// Importación masiva de inventario a partir de la plantilla oficial (Excel / CSV convertido a JSON en el cliente).
    /// La empresa y el usuario responsable se resuelven desde el token JWT; nunca se aceptan desde el body.
    /// Validaciones: DataAnnotations del DTO (400), tamaño máximo 10 MB (413) y rol distinto de Client (403, middleware).
    /// </summary>
    [HttpPost("bulk-import")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [ProducesResponseType(typeof(BulkImportResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
    public async Task<IActionResult> BulkImport(
        [FromBody] BulkImportRequestDto request,
        CancellationToken cancellationToken)
    {
        var actor = await ResolveImportActorAsync(cancellationToken);
        if (actor is null)
        {
            return Unauthorized(new { message = "No fue posible identificar al usuario o a su empresa a partir del token." });
        }

        var result = await bulkImportService.ImportAsync(request, actor, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Resuelve la identidad del usuario autenticado y su empresa:
    /// - Cuenta Identity (Empresa): EnterpriseId desde la empresa asociada a su correo.
    /// - Empleado ({documento}@firmeza.internal): EnterpriseId desde el registro del empleado.
    /// </summary>
    private async Task<ImportActorContext?> ResolveImportActorAsync(CancellationToken cancellationToken)
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
        {
            if (!Guid.TryParse(user.Id, out var userGuid))
            {
                userGuid = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var subGuid)
                    ? subGuid
                    : Guid.NewGuid();
            }

            var userName = !string.IsNullOrWhiteSpace(user.FullName)
                ? user.FullName
                : (user.Email ?? "Administrador");

            var enterprise = await enterpriseRepository.GetByEmailAsync(email);
            return new ImportActorContext(userGuid, userName, enterprise?.Id);
        }

        var docNumber = email.Split('@')[0];
        var employee = await employeeRepository.GetByDocumentNumberAsync(docNumber, cancellationToken);

        if (employee is null && int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var empId))
        {
            employee = await employeeRepository.GetByIdAsync(empId, cancellationToken);
        }

        if (employee is null)
        {
            return null;
        }

        // Mismo esquema de Guid que usa Create para identificar empleados
        var employeeGuid = new Guid(employee.Id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        return new ImportActorContext(employeeGuid, employee.FullName, employee.EnterpriseId);
    }

    /// <summary>
    /// Actualiza los datos de un producto existente.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateProductRequestDto request,
        CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return NotFound(new { message = $"No se encontró el producto con ID {id}." });
        }

        product.Sku = string.IsNullOrWhiteSpace(request.Sku) ? product.Sku : request.Sku;
        product.Barcode = request.Barcode ?? product.Barcode;
        product.Name = request.Name;
        product.Description = request.Description ?? string.Empty;
        product.Category = request.Category;
        product.CategoryDetail = request.CategoryDetail ?? string.Empty;
        product.Location = request.Location;
        product.CostPrice = request.CostPrice;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.StockReserved = request.StockReserved;
        product.MinStock = request.MinStock;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await productRepository.UpdateAsync(product, cancellationToken);

        var regName = await ResolveRegisteredByNameAsync(product, cancellationToken);
        return Ok(MapToDto(product, regName));
    }

    /// <summary>
    /// Elimina un producto del inventario.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return NotFound(new { message = $"No se encontró el producto con ID {id}." });
        }

        await productRepository.DeleteAsync(product, cancellationToken);

        return NoContent();
    }
}