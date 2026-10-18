using Firmeza.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.DbContext.Configurations;

public class SaleDetailConfiguration : IEntityTypeConfiguration<SaleDetail>
{
    public void Configure(EntityTypeBuilder<SaleDetail> builder)
    {
        builder.ToTable("SaleDetails");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.UnitPrice)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Ignore(d => d.Subtotal);

        // Relación N:1 con Sale (Eliminación en cascada si se borra la cabecera de la venta)
        builder.HasOne(d => d.Sale)
            .WithMany(s => s.Details)
            .HasForeignKey(d => d.SaleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación N:1 con Product (Restringida para no permitir borrar productos con historial de venta)
        builder.HasOne(d => d.Product)
            .WithMany()
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
