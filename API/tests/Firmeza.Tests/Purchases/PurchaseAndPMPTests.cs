using Firmeza.Application.DTOs;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Repositories;
using Firmeza.Infrastructure.Services;
using Firmeza.Tests.TestHelpers;
using Microsoft.Extensions.Logging.Abstractions;

namespace Firmeza.Tests.Purchases;

public class PurchaseAndPMPTests
{
    [Fact]
    public async Task CreatePurchase_CalculatesWeightedAverageCost_AndIncrementsStockCorrectly()
    {
        // Arrange (AC-PUR-01 y AC-PUR-02)
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var purchaseRepo = new PurchaseRepository(db);
        var supplierRepo = new SupplierRepository(db);

        var supplier = new Supplier
        {
            TaxId = "900123456-7",
            Name = "Distribuidora Nacional de Aceros",
            IsActive = true
        };
        await db.Suppliers.AddAsync(supplier);

        // Producto inicial: 10 unidades en stock a $1.000 c/u
        var product = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            Sku = "ACE-001",
            Name = "Ángulo Estructural 1x1/8",
            CostPrice = 1000m,
            Price = 1500m,
            Stock = 10,
            IsActive = true
        };
        await db.Products.AddAsync(product);
        await db.SaveChangesAsync();

        var service = new PurchaseService(db, purchaseRepo, supplierRepo, NullLogger<PurchaseService>.Instance);

        // Compra entrante: 10 unidades a $2.000 c/u
        // PMP esperado = ((10 * 1000) + (10 * 2000)) / (10 + 10) = 30000 / 20 = $1.500
        var request = new CreatePurchaseRequestDto
        {
            PurchaseNumber = "FAC-2026-001",
            SupplierId = supplier.Id,
            PaymentMethod = "Crédito 30 días",
            Items =
            [
                new CreatePurchaseItemRequestDto
                {
                    ProductId = product.Id,
                    Quantity = 10,
                    UnitCost = 2000m
                }
            ]
        };

        // Act
        var result = await service.CreateAsync(request, "Encargado de Compras");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Received", result.Status);
        Assert.Equal(20000m, result.TotalAmount); // 10 * 2000

        var freshProduct = await db.Products.FindAsync(product.Id);
        Assert.NotNull(freshProduct);
        // AC-PUR-01: Stock incrementado de 10 a 20
        Assert.Equal(20, freshProduct.Stock);
        // AC-PUR-02: Costo medio ponderado actualizado a $1.500
        Assert.Equal(1500m, freshProduct.CostPrice);
    }

    [Fact]
    public async Task CreatePurchase_WhenInitialStockIsZero_SetsNewCostPriceDirectly()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var purchaseRepo = new PurchaseRepository(db);
        var supplierRepo = new SupplierRepository(db);

        var supplier = new Supplier
        {
            TaxId = "800987654-1",
            Name = "Cementos del Caribe S.A.",
            IsActive = true
        };
        await db.Suppliers.AddAsync(supplier);

        // Producto con stock 0 y costo histórico desactualizado
        var product = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            Sku = "CEM-CAR-01",
            Name = "Cemento Caribe 50kg",
            CostPrice = 18000m,
            Price = 28000m,
            Stock = 0,
            IsActive = true
        };
        await db.Products.AddAsync(product);
        await db.SaveChangesAsync();

        var service = new PurchaseService(db, purchaseRepo, supplierRepo, NullLogger<PurchaseService>.Instance);

        var request = new CreatePurchaseRequestDto
        {
            PurchaseNumber = "REM-5544",
            SupplierId = supplier.Id,
            PaymentMethod = "Transferencia",
            Items =
            [
                new CreatePurchaseItemRequestDto
                {
                    ProductId = product.Id,
                    Quantity = 50,
                    UnitCost = 24500m // Nuevo costo de compra
                }
            ]
        };

        // Act
        var result = await service.CreateAsync(request, "Jefe Almacén");

        // Assert
        var freshProduct = await db.Products.FindAsync(product.Id);
        Assert.NotNull(freshProduct);
        Assert.Equal(50, freshProduct.Stock);
        Assert.Equal(24500m, freshProduct.CostPrice); // Toma el costo entrante
    }

    [Fact]
    public async Task CancelPurchase_RevertsStockSuccessfully()
    {
        // Arrange
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var purchaseRepo = new PurchaseRepository(db);
        var supplierRepo = new SupplierRepository(db);

        var supplier = new Supplier
        {
            TaxId = "900555666-0",
            Name = "Ferretería Industrial Mayorista",
            IsActive = true
        };
        await db.Suppliers.AddAsync(supplier);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            RegisteredById = Guid.NewGuid(),
            Sku = "TOR-001",
            Name = "Tornillo Drywall 1 pulgada",
            CostPrice = 50m,
            Price = 100m,
            Stock = 100,
            IsActive = true
        };
        await db.Products.AddAsync(product);
        await db.SaveChangesAsync();

        var service = new PurchaseService(db, purchaseRepo, supplierRepo, NullLogger<PurchaseService>.Instance);

        var request = new CreatePurchaseRequestDto
        {
            PurchaseNumber = "FAC-9901",
            SupplierId = supplier.Id,
            PaymentMethod = "Efectivo",
            Items =
            [
                new CreatePurchaseItemRequestDto
                {
                    ProductId = product.Id,
                    Quantity = 200,
                    UnitCost = 60m
                }
            ]
        };

        var purchase = await service.CreateAsync(request, "Operador");
        var afterPurchaseProduct = await db.Products.FindAsync(product.Id);
        Assert.Equal(300, afterPurchaseProduct!.Stock); // 100 + 200 = 300

        // Act: Cancelar la orden de compra
        var cancelled = await service.CancelAsync(purchase.Id);

        // Assert
        Assert.True(cancelled);
        var revertedProduct = await db.Products.FindAsync(product.Id);
        Assert.Equal(100, revertedProduct!.Stock); // Revertido a 100
    }
}
