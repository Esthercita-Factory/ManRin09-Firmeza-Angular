using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Firmeza.Infrastructure.DbContext.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.DocumentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(e => e.DocumentNumber)
            .IsUnique();

        builder.Property(e => e.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Phone)
            .HasMaxLength(50);

        builder.Property(e => e.Role)
            .HasMaxLength(100);

        builder.Property(e => e.IsActive)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        // Relación N:1 con Enterprise: el empleado pertenece a la empresa que lo registró
        builder.HasOne(e => e.Enterprise)
            .WithMany(ent => ent.Employees)
            .HasForeignKey(e => e.EnterpriseId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }
}
