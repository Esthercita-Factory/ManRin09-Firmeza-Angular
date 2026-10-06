using Microsoft.AspNetCore.Mvc;

namespace Firmeza.web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlansController : ControllerBase
{
    [HttpGet]
    public IActionResult GetPlans()
    {
        var plans = new[]
        {
            new
            {
                Id = 1,
                Nombre = "Plan Base",
                Descripcion = "Ideal para pequeños negocios que inician su gestión de inventario.",
                PrecioMensual = 29.99m,
                PrecioAnual = 299.99m,
                Caracteristicas = new[]
                {
                    "Gestión de hasta 500 productos",
                    "1 bodega o almacén principal",
                    "Alertas básicas de stock mínimo",
                    "Soporte estándar por correo"
                },
                EsRecomendado = false
            },
            new
            {
                Id = 2,
                Nombre = "Plan Avanzado",
                Descripcion = "Para empresas en expansión con múltiples sedes y mayor volumen.",
                PrecioMensual = 59.99m,
                PrecioAnual = 599.99m,
                Caracteristicas = new[]
                {
                    "Productos y categorías ilimitadas",
                    "Múltiples bodegas y transferencias internas",
                    "Alertas automáticas y reportes avanzados",
                    "Soporte prioritario 24/7"
                },
                EsRecomendado = true
            }
        };

        return Ok(plans);
    }
}