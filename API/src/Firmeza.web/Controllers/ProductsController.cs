using Microsoft.AspNetCore.Mvc;
using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;

namespace Firmeza.web.Controllers;

/// <summary>
/// Controlador API para la gestión integral de productos e inventario.
/// Conectado al servicio de aplicación IProductService.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        var products = productService.GetAll();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var product = productService.GetById(id);
        if (product is null)
        {
            return NotFound(new { message = $"Producto con id/sku '{id}' no encontrado." });
        }
        return Ok(product);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateProductRequestDto request)
    {
        try
        {
            var created = productService.Create(request);
            Console.WriteLine($"[Productos] Producto creado exitosamente: {created.Sku} - {created.Name} (Stock: {created.StockTotal})");
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error inesperado al crear el producto.", detail = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateProductRequestDto request)
    {
        try
        {
            var updated = productService.Update(id, request);
            if (updated is null)
            {
                return NotFound(new { message = $"No se encontró el producto con identificador '{id}'." });
            }
            Console.WriteLine($"[Productos] Producto actualizado exitosamente: {updated.Sku} - {updated.Name}");
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error inesperado al actualizar el producto.", detail = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var success = productService.Delete(id);
        if (!success)
        {
            return NotFound(new { message = $"No se encontró el producto con id/sku '{id}' para eliminar." });
        }
        Console.WriteLine($"[Productos] Producto eliminado exitosamente: {id}");
        return Ok(new { success = true, message = "Producto eliminado exitosamente." });
    }
}
