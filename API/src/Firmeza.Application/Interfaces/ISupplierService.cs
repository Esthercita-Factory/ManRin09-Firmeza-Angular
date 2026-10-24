using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

public interface ISupplierService
{
    Task<IEnumerable<SupplierResponseDto>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default);
    Task<SupplierResponseDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<SupplierResponseDto> CreateAsync(CreateSupplierRequestDto request, int? enterpriseId = null, CancellationToken ct = default);
    Task<SupplierResponseDto?> UpdateAsync(int id, UpdateSupplierRequestDto request, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
