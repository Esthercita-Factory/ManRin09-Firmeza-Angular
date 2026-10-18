using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Firmeza.web.Middlewares;

/// <summary>
/// Middleware global de manejo de excepciones.
/// Para rutas /api/* devuelve un JSON estructurado sin exponer stack traces.
/// Para rutas MVC/Razor relanza la excepción para que el pipeline web muestre la vista de error.
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            logger.LogInformation("La solicitud HTTP fue cancelada por el cliente: {Method} {Path}", context.Request.Method, context.Request.Path);

            if (!context.Response.HasStarted)
            {
                context.Response.StatusCode = 499; // Client Closed Request
            }
        }
        catch (Exception ex)
        {
            var path = context.Request.Path.Value ?? string.Empty;

            // Si la petición pertenece a la API REST, devolver JSON estructurado
            if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
            {
                await HandleApiExceptionAsync(context, ex);
            }
            else
            {
                // Para peticiones MVC/Razor: relanzar para que el pipeline web
                // muestre la vista de error correspondiente (e.g. /Home/Error)
                throw;
            }
        }
    }

    private async Task HandleApiExceptionAsync(HttpContext context, Exception exception)
    {
        logger.LogError(exception, "Excepción no controlada en la API [{Method} {Path}]: {Message}",
            context.Request.Method,
            context.Request.Path,
            exception.Message);

        if (context.Response.HasStarted)
        {
            logger.LogWarning("La respuesta ya se había iniciado; no es posible escribir el cuerpo de error JSON.");
            return;
        }

        var (statusCode, message) = exception switch
        {
            ArgumentNullException => (HttpStatusCode.BadRequest, "La solicitud contiene datos nulos o inválidos."),
            ArgumentException => (HttpStatusCode.BadRequest, exception.Message),
            InvalidOperationException => (HttpStatusCode.Conflict, exception.Message),
            DbUpdateConcurrencyException => (HttpStatusCode.Conflict, "El registro fue modificado por otro usuario o proceso. Recargue e intente nuevamente."),
            DbUpdateException => (HttpStatusCode.Conflict, "No se pudo completar la operación debido a una restricción de integridad en la base de datos (datos duplicados o registros asociados)."),
            KeyNotFoundException => (HttpStatusCode.NotFound, "El recurso solicitado no fue encontrado."),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "No tiene autorización para realizar esta acción."),
            _ => (HttpStatusCode.InternalServerError, "Ocurrió un error interno en el servidor.")
        };

        context.Response.Clear();
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var errorResponse = new
        {
            Status = (int)statusCode,
            Message = message,
            Path = context.Request.Path.Value,
            TraceId = context.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse, JsonOptions));
    }
}
