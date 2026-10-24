using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

public interface IPurchaseService
{
    Task<IEnumerable<PurchaseResponseDto>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default);
    Task<PurchaseResponseDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<PurchaseResponseDto>> GetBySupplierIdAsync(int supplierId, CancellationToken ct = default);

    /// <summary>
    /// Registra la recepción de una compra aplicando:
    /// 1. Suma automática de existencias al stock actual (AC-PUR-01).
    /// 2. Actualización de costo ponderado de referencia (PMP) en inventario (AC-PUR-02).
    /// 3. Transacción atómica garantizada.
    /// </summary>
    Task<PurchaseResponseDto> CreateAsync(
        CreatePurchaseRequestDto request,
        string receivedByName,
        int? enterpriseId = null,
        CancellationToken ct = default);

    /// <summary>
    /// Cancela una orden de compra revirtiendo el stock recibido de los productos.
    /// </summary>
    Task<bool> CancelAsync(int id, CancellationToken ct = default);
}
