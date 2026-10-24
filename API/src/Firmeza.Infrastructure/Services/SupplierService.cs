using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;

namespace Firmeza.Infrastructure.Services;

public class SupplierService(ISupplierRepository supplierRepository) : ISupplierService
{
    private static SupplierResponseDto MapToDto(Supplier s) => new(
        s.Id,
        s.TaxId,
        s.Name,
        s.ContactName,
        s.Email,
        s.Phone,
        s.Address,
        s.IsActive,
        s.EnterpriseId,
        s.CreatedAt
    );

    public async Task<IEnumerable<SupplierResponseDto>> GetAllAsync(int? enterpriseId = null, CancellationToken ct = default)
    {
        var suppliers = await supplierRepository.GetAllAsync(enterpriseId, ct);
        return suppliers.Select(MapToDto);
    }

    public async Task<SupplierResponseDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var supplier = await supplierRepository.GetByIdAsync(id, ct);
        return supplier is not null ? MapToDto(supplier) : null;
    }

    public async Task<SupplierResponseDto> CreateAsync(
        CreateSupplierRequestDto request,
        int? enterpriseId = null,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var cleanTaxId = request.TaxId.Trim();
        var existing = await supplierRepository.GetByTaxIdAsync(cleanTaxId, enterpriseId, ct);
        if (existing is not null)
        {
            throw new InvalidOperationException($"Ya existe un proveedor con la identificación tributaria / NIT '{cleanTaxId}'.");
        }

        var supplier = new Supplier
        {
            TaxId = cleanTaxId,
            Name = request.Name.Trim(),
            ContactName = request.ContactName?.Trim() ?? string.Empty,
            Email = request.Email?.Trim() ?? string.Empty,
            Phone = request.Phone?.Trim() ?? string.Empty,
            Address = request.Address?.Trim() ?? string.Empty,
            IsActive = true,
            EnterpriseId = enterpriseId ?? request.EnterpriseId,
            CreatedAt = DateTime.UtcNow
        };

        await supplierRepository.AddAsync(supplier, ct);
        return MapToDto(supplier);
    }

    public async Task<SupplierResponseDto?> UpdateAsync(
        int id,
        UpdateSupplierRequestDto request,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var supplier = await supplierRepository.GetByIdAsync(id, ct);
        if (supplier is null)
        {
            return null;
        }

        var cleanTaxId = request.TaxId.Trim();
        var duplicate = await supplierRepository.GetByTaxIdAsync(cleanTaxId, supplier.EnterpriseId, ct);
        if (duplicate is not null && duplicate.Id != id)
        {
            throw new InvalidOperationException($"Ya existe otro proveedor con la identificación tributaria / NIT '{cleanTaxId}'.");
        }

        supplier.TaxId = cleanTaxId;
        supplier.Name = request.Name.Trim();
        supplier.ContactName = request.ContactName?.Trim() ?? string.Empty;
        supplier.Email = request.Email?.Trim() ?? string.Empty;
        supplier.Phone = request.Phone?.Trim() ?? string.Empty;
        supplier.Address = request.Address?.Trim() ?? string.Empty;
        supplier.IsActive = request.IsActive;

        await supplierRepository.UpdateAsync(supplier, ct);
        return MapToDto(supplier);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var supplier = await supplierRepository.GetByIdAsync(id, ct);
        if (supplier is null)
        {
            return false;
        }

        supplier.IsActive = false;
        await supplierRepository.UpdateAsync(supplier, ct);
        return true;
    }
}
