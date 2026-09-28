using Firmeza.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.DbContext.Configurations;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.ToTable("Clients");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(c => c.Email)
            .IsUnique();

        builder.Property(c => c.Phone)
            .HasMaxLength(20);

        builder.Property(c => c.PasswordHash)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.IsActive)
            .IsRequired();

        // Relación uno a muchos con Enterprise:
        // Un cliente puede pertenecer/comprar a una ferretería (Enterprise),
        // pero la ferretería no es un cliente, garantizando la direccionalidad correcta.
        builder.HasOne(c => c.Enterprise)
            .WithMany(e => e.Clients)
            .HasForeignKey(c => c.EnterpriseId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }
}
