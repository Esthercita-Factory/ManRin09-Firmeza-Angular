using Firmeza.Application.DTOs;
using Firmeza.Application.Interfaces;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Repositories;
using Firmeza.Infrastructure.Services;
using Firmeza.Tests.TestHelpers;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace Firmeza.Tests.Sales;

public class SaleAndConsumidorFinalTests
{
    [Fact]
    public async Task CreateSale_WhenStockIsInsufficient_ThrowsInvalidOperationExceptionAndRollsBack()
    {
        // Arrange (AC-PROD-03)
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var saleRepo = new SaleRepository(db);
        var clientRepoMock = new Mock<IClientRepository>();

        var product = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            Name = "Pintura Blanca 1 Galón",
            Sku = "PIN-001",
            Price = 55000m,
            CostPrice = 40000m,
            Stock = 5, // Solo 5 disponibles
            IsActive = true
        };
        await db.Products.AddAsync(product);
        await db.SaveChangesAsync();

        var service = new SaleService(db, saleRepo, clientRepoMock.Object, NullLogger<SaleService>.Instance);

        var request = new CreateSaleRequestDto
        {
            ClientId = null, // Consumidor Final
            PaymentMethod = "Efectivo",
            IsPaid = true,
            Items =
            [
                new CreateSaleItemRequestDto
                {
                    ProductId = product.Id,
                    Quantity = 10, // Se piden 10 (excede 5)
                    UnitPrice = 55000m
                }
            ]
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateAsync(request, "Vendedor"));

        Assert.Contains("Stock insuficiente", ex.Message);

        // Verificar que el stock no fue alterado (5 unidades intactas)
        var freshProduct = await db.Products.FindAsync(product.Id);
        Assert.NotNull(freshProduct);
        Assert.Equal(5, freshProduct.Stock);
    }

    [Fact]
    public async Task CreateSale_WhenClientIdIsNull_CreatesSaleForConsumidorFinal()
    {
        // Arrange (AC-CLI-02)
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var saleRepo = new SaleRepository(db);
        var clientRepoMock = new Mock<IClientRepository>();

        var product = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            Name = "Tubo PVC 1/2 pulgada",
            Sku = "TUB-001",
            Price = 12000m,
            CostPrice = 8000m,
            Stock = 20,
            IsActive = true
        };
        await db.Products.AddAsync(product);
        await db.SaveChangesAsync();

        var service = new SaleService(db, saleRepo, clientRepoMock.Object, NullLogger<SaleService>.Instance);

        var request = new CreateSaleRequestDto
        {
            ClientId = null, // Venta mostrador a Consumidor Final
            PaymentMethod = "Efectivo",
            IsPaid = true,
            Items =
            [
                new CreateSaleItemRequestDto
                {
                    ProductId = product.Id,
                    Quantity = 3,
                    UnitPrice = 12000m
                }
            ]
        };

        // Act
        var result = await service.CreateAsync(request, "Cajero Mostrador");

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.ClientId);
        Assert.Equal("Consumidor Final", result.ClientName);
        Assert.Equal(36000m, result.TotalAmount);
        Assert.Equal(3, result.Quantity);

        // Verificar deducción automática de stock
        var freshProduct = await db.Products.FindAsync(product.Id);
        Assert.NotNull(freshProduct);
        Assert.Equal(17, freshProduct.Stock); // 20 - 3 = 17
    }

    [Fact]
    public async Task DeleteSale_RevertsProductStockCorrectly()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var saleRepo = new SaleRepository(db);
        var clientRepoMock = new Mock<IClientRepository>();

        var product = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            Name = "Disco de Corte 4.5",
            Sku = "DIS-001",
            Price = 6000m,
            CostPrice = 3500m,
            Stock = 50,
            IsActive = true
        };
        await db.Products.AddAsync(product);
        await db.SaveChangesAsync();

        var service = new SaleService(db, saleRepo, clientRepoMock.Object, NullLogger<SaleService>.Instance);

        var request = new CreateSaleRequestDto
        {
            ClientId = null,
            PaymentMethod = "Tarjeta",
            IsPaid = true,
            Items =
            [
                new CreateSaleItemRequestDto
                {
                    ProductId = product.Id,
                    Quantity = 5,
                    UnitPrice = 6000m
                }
            ]
        };

        var createdSale = await service.CreateAsync(request, "Administrador");

        var afterSaleProduct = await db.Products.FindAsync(product.Id);
        Assert.Equal(45, afterSaleProduct!.Stock); // 50 - 5 = 45

        // Act: Anular/Eliminar la venta
        var deleted = await service.DeleteAsync(createdSale.Id);

        // Assert: El stock debe regresar a 50 unidades
        Assert.True(deleted);
        var revertedProduct = await db.Products.FindAsync(product.Id);
        Assert.Equal(50, revertedProduct!.Stock);
    }
}
