using Firmeza.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.DbContext.Configurations;

public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.ToTable("Sales");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.TotalAmount)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(s => s.PaymentMethod)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(s => s.ScheduledBy)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(s => s.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasOne(s => s.Client)
            .WithMany(c => c.Sales)
            .HasForeignKey(s => s.ClientId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
