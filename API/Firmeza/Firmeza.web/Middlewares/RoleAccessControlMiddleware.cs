namespace Firmeza.web.Middlewares;

/// <summary>
/// Middleware que impide a usuarios con rol "Client" acceder al panel de administración web (MVC/Razor).
/// Solo actúa sobre rutas que NO sean de la API REST ni archivos estáticos.
/// </summary>
public class RoleAccessControlMiddleware(RequestDelegate next)
{
    // Segmentos de ruta que corresponden a archivos estáticos y deben ser ignorados
    private static readonly string[] StaticPrefixes = ["/css", "/js", "/lib", "/favicon.ico", "/_framework"];

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // No interceptar rutas de la API REST
        if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }

        // No interceptar archivos estáticos
        if (IsStaticAsset(path))
        {
            await next(context);
            return;
        }

        // Verificar si el usuario autenticado tiene el rol "Client"
        if (context.User.Identity?.IsAuthenticated == true
            && context.User.IsInRole("Client"))
        {
            // Denegar acceso al panel de administración web
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.Redirect("/Account/AccessDenied");
            return;
        }

        await next(context);
    }

    private static bool IsStaticAsset(string path)
    {
        foreach (var prefix in StaticPrefixes)
        {
            if (path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }
}
