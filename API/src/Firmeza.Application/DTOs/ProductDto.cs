namespace Firmeza.Application.DTOs;

public record ProductDto(
    string Id,
    string Sku,
    string Barcode,
    string Name,
    string Category,
    string CategoryDetail,
    string Location,
    string StockTotal,
    string StockReserved,
    string StockAvailable,
    int StockLevelPercent,
    string StockStatus,
    string StockStatusClass,
    string CostPrice,
    string SalePrice,
    string LastMovement,
    string ImageIcon
);

public record CreateProductRequestDto(
    string Sku,
    string Name,
    string? Category,
    string? CategoryDetail,
    int Stock,
    string? Location,
    string? CostPrice,
    string? SalePrice,
    string? ImageIcon
);

public record UpdateProductRequestDto(
    string Name,
    string? Category,
    string? CategoryDetail,
    int Stock,
    string? Location,
    string? CostPrice,
    string? SalePrice,
    string? ImageIcon
);
