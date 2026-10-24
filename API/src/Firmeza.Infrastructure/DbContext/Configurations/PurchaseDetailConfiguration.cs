using Firmeza.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.DbContext.Configurations;

public class PurchaseDetailConfiguration : IEntityTypeConfiguration<PurchaseDetail>
{
    public void Configure(EntityTypeBuilder<PurchaseDetail> builder)
    {
        builder.ToTable("PurchaseDetails");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Quantity)
            .IsRequired();

        builder.Property(d => d.UnitCost)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(d => d.Purchase)
            .WithMany(p => p.Details)
            .HasForeignKey(d => d.PurchaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Product)
            .WithMany()
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(d => d.PurchaseId);
        builder.HasIndex(d => d.ProductId);
    }
}
