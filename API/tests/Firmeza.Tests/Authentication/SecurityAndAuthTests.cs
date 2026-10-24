using Firmeza.Application.DTOs;
using Firmeza.Application.Services;
using Firmeza.Domain.Entities;
using Firmeza.Infrastructure.Repositories;
using Firmeza.Infrastructure.Services;
using Firmeza.Tests.TestHelpers;

namespace Firmeza.Tests.Authentication;

public class SecurityAndAuthTests
{
    [Fact]
    public void PasswordHasher_HashesAndVerifiesPasswordCorrectly()
    {
        // Arrange (AC-AUTH-01)
        var hasher = new PasswordHasher();
        var rawPassword = "Password123*!";

        // Act
        var hash = hasher.Hash(rawPassword);
        var isValid = hasher.Verify(rawPassword, hash);
        var isInvalid = hasher.Verify("WrongPassword", hash);

        // Assert
        Assert.NotNull(hash);
        Assert.StartsWith("$2", hash); // Algoritmo seguro BCrypt
        Assert.True(isValid);
        Assert.False(isInvalid);
    }

    [Fact]
    public async Task EmployeeService_CreatesEmployeeWithHashedPassword()
    {
        // Arrange (AC-AUTH-01)
        using var db = TestDbContextFactory.CreateInMemoryContext();
        var repo = new EmployeeRepository(db);
        var hasher = new PasswordHasher();
        var service = new EmployeeService(repo, hasher);

        var enterprise = new Enterprise
        {
            BusinessName = "Ferretería El Triunfo",
            TaxId = "901234567-8",
            CorporateEmail = "contacto@eltriunfo.com",
            PasswordHash = "hash123",
            IsActive = true
        };
        await db.Enterprises.AddAsync(enterprise);
        await db.SaveChangesAsync();

        var request = new CreateEmployeeRequestDto
        {
            DocumentNumber = "1098765432",
            FullName = "Carlos Gómez",
            Phone = "3001234567",
            Role = "Cajero",
            IsActive = true,
            Password = "SecurePassword2026!"
        };

        // Act
        var created = await service.CreateAsync(enterprise.Id, request);

        // Assert
        Assert.NotNull(created);
        Assert.Equal("Carlos Gómez", created.FullName);

        var savedEmployee = await db.Employees.FindAsync(created.Id);
        Assert.NotNull(savedEmployee);
        Assert.NotNull(savedEmployee.PasswordHash);
        Assert.StartsWith("$2", savedEmployee.PasswordHash); // BCrypt
        Assert.True(hasher.Verify("SecurePassword2026!", savedEmployee.PasswordHash));
    }
}
