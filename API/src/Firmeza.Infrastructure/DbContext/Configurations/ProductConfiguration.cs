using Firmeza.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.DbContext.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        // Token de concurrencia optimista para proteger el stock
        builder.Property(p => p.Version)
            .IsRowVersion();

        builder.Property(p => p.Sku)
            .IsRequired()
            .HasMaxLength(100);

        // SKU único por empresa
        builder.HasIndex(p => new { p.EnterpriseId, p.Sku })
            .IsUnique();

        builder.Property(p => p.Barcode)
            .HasMaxLength(100);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Category)
            .HasMaxLength(100);

        builder.Property(p => p.CategoryDetail)
            .HasMaxLength(100);

        builder.Property(p => p.UnitOfMeasure)
            .IsRequired()
            .HasMaxLength(30)
            .HasDefaultValue("Unidad");

        builder.Property(p => p.Location)
            .HasMaxLength(100);

        builder.Property(p => p.CostPrice)
            .HasPrecision(18, 2);

        builder.Property(p => p.Price)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(p => p.Stock)
            .IsRequired();

        builder.Property(p => p.StockReserved)
            .HasDefaultValue(0);

        builder.Property(p => p.MinStock)
            .HasDefaultValue(0);

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.RegisteredById)
            .IsRequired(false);

        builder.Property(p => p.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(p => p.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        // Relación N:1 con Enterprise
        builder.HasOne(p => p.Enterprise)
            .WithMany(ent => ent.Products)
            .HasForeignKey(p => p.EnterpriseId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Índices de búsqueda
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.EnterpriseId);
    }
}
