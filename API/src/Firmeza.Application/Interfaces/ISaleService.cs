using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

/// <summary>
/// Contrato del servicio de ventas para el procesamiento de transacciones comerciales,
/// validación de existencias, deducción automática de stock y generación de alertas de inventario.
/// </summary>
public interface ISaleService
{
    Task<IEnumerable<SaleResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SaleResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<SaleResponseDto>> GetByClientIdAsync(int clientId, CancellationToken cancellationToken = default);
    Task<SaleResponseDto> CreateAsync(CreateSaleRequestDto request, string scheduledByName, CancellationToken cancellationToken = default);
    Task<SaleResponseDto?> UpdateAsync(int id, UpdateSaleRequestDto request, CancellationToken cancellationToken = default);
    Task<SaleResponseDto?> TogglePaidAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
