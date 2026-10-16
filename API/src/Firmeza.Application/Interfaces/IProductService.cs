using Firmeza.Application.DTOs;

namespace Firmeza.Application.Interfaces;

public interface IProductService
{
    IEnumerable<ProductDto> GetAll();
    ProductDto? GetById(string id);
    ProductDto Create(CreateProductRequestDto request);
    ProductDto? Update(string id, UpdateProductRequestDto request);
    bool Delete(string id);
}
