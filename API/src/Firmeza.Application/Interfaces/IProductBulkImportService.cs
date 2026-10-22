using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

/// <summary>
/// Datos del usuario autenticado que ejecuta la importación (resueltos en el servidor, nunca desde el body).
/// </summary>
public record ImportActorContext(Guid RegisteredById, string RegisteredByName, int? EnterpriseId);

/// <summary>
/// Caso de uso de importación masiva de inventario desde la plantilla oficial.
/// </summary>
public interface IProductBulkImportService
{
    Task<BulkImportResultDto> ImportAsync(BulkImportRequestDto request, ImportActorContext actor, CancellationToken ct = default);
}
