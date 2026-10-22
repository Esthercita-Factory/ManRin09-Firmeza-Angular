using System.Text.Json;
using Microsoft.AspNetCore.Http.Features;

namespace Firmeza.web.Middlewares;

/// <summary>
/// Middleware de protección para la importación masiva de inventario (POST /api/products/bulk-import).
/// Se ejecuta antes del model binding para descartar peticiones inválidas sin cargarlas en memoria:
/// - 415 Unsupported Media Type: si el cuerpo no es application/json.
/// - 413 Payload Too Large: si el cuerpo declarado supera el límite permitido.
/// - Ajusta MaxRequestBodySize para cubrir también peticiones sin Content-Length (chunked).
/// El control de roles (bloqueo a "Client") lo realiza RoleAccessControlMiddleware.
/// </summary>
public class BulkImportGuardMiddleware(RequestDelegate next, ILogger<BulkImportGuardMiddleware> logger)
{
    public const string BulkImportPath = "/api/products/bulk-import";
    public const long MaxBodyBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;

        if (!HttpMethods.IsPost(request.Method)
            || !request.Path.Equals(BulkImportPath, StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }

        // 1. Solo se acepta JSON (el frontend convierte el Excel/CSV a JSON antes de enviarlo)
        if (request.ContentType is null
            || !request.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
        {
            await WriteErrorAsync(context, StatusCodes.Status415UnsupportedMediaType,
                "La importación debe enviarse en formato JSON (Content-Type: application/json).");
            return;
        }

        // 2. Rechazo temprano por tamaño declarado
        if (request.ContentLength is > MaxBodyBytes)
        {
            logger.LogWarning("Importación rechazada: {Bytes} bytes superan el límite de {Max} bytes.",
                request.ContentLength, MaxBodyBytes);

            await WriteErrorAsync(context, StatusCodes.Status413PayloadTooLarge,
                $"El lote de importación supera el tamaño máximo permitido de {MaxBodyBytes / (1024 * 1024)} MB.");
            return;
        }

        // 3. Límite efectivo para cuerpos sin Content-Length (transfer-encoding: chunked)
        var bodySizeFeature = context.Features.Get<IHttpMaxRequestBodySizeFeature>();
        if (bodySizeFeature is { IsReadOnly: false })
        {
            bodySizeFeature.MaxRequestBodySize = MaxBodyBytes;
        }

        await next(context);
    }

    private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = new
        {
            Status = statusCode,
            Message = message,
            Path = context.Request.Path.Value,
            Timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
