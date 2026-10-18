using System.Text.Json;

namespace Firmeza.web.Middlewares;

/// <summary>
/// Middleware de control de acceso basado en roles ("Enterprise", "Employee", "Client").
/// - En rutas MVC/Razor: impide a usuarios con rol "Client" acceder al panel administrativo, evitando bucles de redirección.
/// - En rutas /api/*: aplica la matriz de permisos por rol devolviendo respuestas 403 en JSON estructurado.
/// </summary>
public class RoleAccessControlMiddleware(RequestDelegate next)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    // Prefijos de archivos estáticos, herramientas de documentación y rutas de cuenta excluidas para evitar bucles
    private static readonly string[] IgnoredPrefixes =
    [
        "/css",
        "/js",
        "/lib",
        "/favicon.ico",
        "/_framework",
        "/swagger",
        "/openapi",
        "/Account/AccessDenied",
        "/Account/Login",
        "/Account/Logout"
    ];

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // 1. No interceptar archivos estáticos, Swagger ni la vista de acceso denegado
        if (IsIgnoredPath(path))
        {
            await next(context);
            return;
        }

        // 2. Si el usuario no está autenticado, delegar a los atributos [Authorize] de los controladores
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await next(context);
            return;
        }

        var isEnterprise = context.User.IsInRole("Enterprise");
        var isEmployee = context.User.IsInRole("Employee");
        var isClient = context.User.IsInRole("Client");

        // 3. Reglas para rutas de la API REST (/api/*)
        if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
        {
            var method = context.Request.Method;
            var isWriteOperation = HttpMethods.IsPost(method)
                                   || HttpMethods.IsPut(method)
                                   || HttpMethods.IsPatch(method)
                                   || HttpMethods.IsDelete(method);

            // Gestión de empleados (/api/employees): exclusivo para rol "Enterprise"
            if (path.StartsWith("/api/employees", StringComparison.OrdinalIgnoreCase) && !isEnterprise)
            {
                await WriteForbiddenJsonAsync(context, "Acceso denegado: solo una cuenta de Empresa puede gestionar empleados.");
                return;
            }

            // Restricciones para el rol "Client" en la API
            if (isClient && !isEnterprise && !isEmployee)
            {
                // Un cliente no puede modificar el catálogo de productos ni administrar otros clientes
                if ((path.StartsWith("/api/products", StringComparison.OrdinalIgnoreCase) && isWriteOperation)
                    || path.StartsWith("/api/clients", StringComparison.OrdinalIgnoreCase))
                {
                    await WriteForbiddenJsonAsync(context, "Acceso denegado: los clientes no tienen permisos para modificar el inventario ni gestionar clientes.");
                    return;
                }
            }

            await next(context);
            return;
        }

        // 4. Reglas para vistas web MVC/Razor: bloquear acceso al panel administrativo a usuarios con rol "Client"
        if (isClient && !isEnterprise && !isEmployee)
        {
            context.Response.Redirect("/Account/AccessDenied");
            return;
        }

        await next(context);
    }

    private static bool IsIgnoredPath(string path)
    {
        foreach (var prefix in IgnoredPrefixes)
        {
            if (path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static async Task WriteForbiddenJsonAsync(HttpContext context, string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        context.Response.ContentType = "application/json";

        var payload = new
        {
            Status = StatusCodes.Status403Forbidden,
            Message = message,
            Path = context.Request.Path.Value,
            Timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
