using System.ComponentModel.DataAnnotations;
using Firmeza.Application.DTOs;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Repositories;
using Firmeza.Tests.TestHelpers;

namespace Firmeza.Tests.Catalog;

public class ProductValidationAndFilterTests
{
    [Fact]
    public void CreateProductRequestDto_WhenPriceIsLowerThanCostPrice_ReturnsValidationError()
    {
        // Arrange (AC-PROD-02)
        var dto = new CreateProductRequestDto
        {
            Sku = "CEM-001",
            Name = "Cemento Gris 50kg",
            Category = "Construcción",
            Location = "Nave A",
            CostPrice = 30000m,
            Price = 25000m, // Precio menor al costo
            Stock = 50,
            MinStock = 5
        };

        var context = new ValidationContext(dto);
        var results = new List<ValidationResult>();

        // Act
        var isValid = Validator.TryValidateObject(dto, context, results, validateAllProperties: true);

        // Assert
        Assert.False(isValid);
        Assert.Contains(results, r => r.ErrorMessage != null && r.ErrorMessage.Contains("no puede ser menor al precio de costo"));
    }

    [Fact]
    public void CreateProductRequestDto_WhenPriceIsZeroOrNegative_ReturnsValidationError()
    {
        // Arrange (AC-PROD-02)
        var dto = new CreateProductRequestDto
        {
            Sku = "CEM-002",
            Name = "Cemento Gris 50kg",
            Category = "Construcción",
            Location = "Nave A",
            CostPrice = 1000m,
            Price = 0m,
            Stock = 10,
            MinStock = 5
        };

        var context = new ValidationContext(dto);
        var results = new List<ValidationResult>();

        // Act
        var isValid = Validator.TryValidateObject(dto, context, results, validateAllProperties: true);

        // Assert
        Assert.False(isValid);
        Assert.Contains(results, r => r.ErrorMessage != null && r.ErrorMessage.Contains("mayor a cero"));
    }

    [Fact]
    public void CreateProductRequestDto_WhenPriceIsGreaterThanOrEqualToCostPrice_IsValid()
    {
        // Arrange
        var dto = new CreateProductRequestDto
        {
            Sku = "CEM-003",
            Name = "Cemento Blanco 50kg",
            Category = "Construcción",
            Location = "Nave A",
            CostPrice = 20000m,
            Price = 28000m,
            Stock = 20,
            MinStock = 5
        };

        var context = new ValidationContext(dto);
        var results = new List<ValidationResult>();

        // Act
        var isValid = Validator.TryValidateObject(dto, context, results, validateAllProperties: true);

        // Assert
        Assert.True(isValid);
        Assert.Empty(results);
    }

    [Fact]
    public void BulkImportProductItemDto_WhenSalePriceLowerThanCost_FailsValidation()
    {
        // Arrange
        var row = new BulkImportProductItemDto
        {
            Sku = "VAR-001",
            Name = "Varilla Corrugada 1/2",
            Category = "Aceros",
            CostPrice = 45000m,
            SalePrice = 40000m, // Menor al costo
            Stock = 100
        };

        var context = new ValidationContext(row);
        var results = new List<ValidationResult>();

        // Act
        var isValid = Validator.TryValidateObject(row, context, results, validateAllProperties: true);

        // Assert
        Assert.False(isValid);
        Assert.Contains(results, r => r.ErrorMessage != null && r.ErrorMessage.Contains("no puede ser menor al precio de costo"));
    }

    [Fact]
    public async Task ProductRepository_GetPagedAsync_FiltersAndPaginatesCorrectly()
    {
        // Arrange (AC-PROD-04)
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var repo = new ProductRepository(db);

        var enterpriseId = 1;
        var p1 = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            EnterpriseId = enterpriseId,
            Sku = "CEM-01",
            Name = "Cemento Argos Gris",
            Category = "Construcción",
            Price = 32000m,
            CostPrice = 25000m,
            Stock = 100,
            UnitOfMeasure = "Bolsa",
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        };
        var p2 = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            EnterpriseId = enterpriseId,
            Sku = "CEM-02",
            Name = "Cemento Blanco",
            Category = "Construcción",
            Price = 45000m,
            CostPrice = 35000m,
            Stock = 0, // Sin existencias
            UnitOfMeasure = "Bolsa",
            CreatedAt = DateTime.UtcNow.AddMinutes(-5)
        };
        var p3 = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            EnterpriseId = enterpriseId,
            Sku = "HER-01",
            Name = "Martillo Bellota",
            Category = "Herramientas",
            Price = 28000m,
            CostPrice = 18000m,
            Stock = 15,
            UnitOfMeasure = "Unidad",
            CreatedAt = DateTime.UtcNow
        };

        await db.Products.AddRangeAsync(p1, p2, p3);
        await db.SaveChangesAsync();

        // Act 1: Búsqueda por texto "Cemento" y en stock únicamente
        var filterInStock = new ProductFilterDto
        {
            EnterpriseId = enterpriseId,
            Search = "cemento",
            InStockOnly = true,
            Page = 1,
            PageSize = 10
        };
        var result1 = await repo.GetPagedAsync(filterInStock);

        // Assert 1: Solo debe traer Cemento Argos Gris (stock > 0)
        Assert.Single(result1.Items);
        Assert.Equal("CEM-01", result1.Items.First().Sku);
        Assert.Equal(1, result1.TotalCount);

        // Act 2: Filtro por categoría "Herramientas"
        var filterCategory = new ProductFilterDto
        {
            EnterpriseId = enterpriseId,
            Category = "Herramientas"
        };
        var result2 = await repo.GetPagedAsync(filterCategory);

        // Assert 2
        Assert.Single(result2.Items);
        Assert.Equal("Martillo Bellota", result2.Items.First().Name);

        // Act 3: Filtro por rango de precio (30000 a 50000)
        var filterPrice = new ProductFilterDto
        {
            EnterpriseId = enterpriseId,
            MinPrice = 30000m,
            MaxPrice = 50000m
        };
        var result3 = await repo.GetPagedAsync(filterPrice);

        // Assert 3
        Assert.Equal(2, result3.TotalCount);
        Assert.All(result3.Items, item => Assert.InRange(item.Price, 30000m, 50000m));
    }
}
