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
    IProductRepository productRepository) : ControllerBase
{
    private static ProductResponseDto MapToDto(Product p) => new(
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
        p.EnterpriseId,
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
        var response = products.Select(MapToDto);
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

        return Ok(MapToDto(product));
    }

    /// <summary>
    /// Registra un nuevo producto en el inventario identificando al usuario mediante su JWT.
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

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return Unauthorized(new { message = "El usuario asociado al token no existe en la base de datos." });
        }

        if (!Guid.TryParse(user.Id, out var registeredByGuid))
        {
            registeredByGuid = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var subGuid)
                ? subGuid
                : Guid.NewGuid();
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
            Barcode = request.Barcode,
            Name = request.Name,
            Description = request.Description,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category,
            CategoryDetail = request.CategoryDetail,
            Location = request.Location,
            CostPrice = request.CostPrice,
            Price = request.Price,
            Stock = request.Stock,
            StockReserved = request.StockReserved,
            MinStock = request.MinStock,
            IsActive = true,
            RegisteredById = registeredByGuid,
            EnterpriseId = request.EnterpriseId,
            CreatedAt = DateTime.UtcNow
        };

        await productRepository.AddAsync(product, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToDto(product));
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
        product.Barcode = request.Barcode;
        product.Name = request.Name;
        product.Description = request.Description;
        product.Category = request.Category;
        product.CategoryDetail = request.CategoryDetail;
        product.Location = request.Location;
        product.CostPrice = request.CostPrice;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.StockReserved = request.StockReserved;
        product.MinStock = request.MinStock;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await productRepository.UpdateAsync(product, cancellationToken);

        return Ok(MapToDto(product));
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