using Firmeza.Application.DTOs;

namespace Firmeza.Application.Common.Interfaces;

/// <summary>
/// Contrato del servicio de operaciones CRUD para la entidad Client.
/// </summary>
public interface IClientService
{
    Task<IEnumerable<ClientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ClientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ClientResponseDto> CreateAsync(CreateClientRequestDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(int id, UpdateClientRequestDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
