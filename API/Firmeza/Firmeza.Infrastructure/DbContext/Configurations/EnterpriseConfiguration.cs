using Firmeza.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.DbContext.Configurations;

public class EnterpriseConfiguration : IEntityTypeConfiguration<Enterprise>
{
    public void Configure(EntityTypeBuilder<Enterprise> builder)
    {
        builder.ToTable("Enterprises");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.BusinessName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.TaxId)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(e => e.TaxId)
            .IsUnique();

        builder.Property(e => e.ContactName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(e => e.CorporateEmail)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(e => e.CorporateEmail)
            .IsUnique();

        builder.Property(e => e.CorporatePhone)
            .HasMaxLength(20);

        builder.Property(e => e.PasswordHash)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.IsActive)
            .IsRequired();

        // Relación uno a muchos: una empresa puede tener muchos clientes vinculados por EnterpriseId
        builder.HasMany(e => e.Clients)
            .WithOne(c => c.Enterprise)
            .HasForeignKey(c => c.EnterpriseId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }
}
