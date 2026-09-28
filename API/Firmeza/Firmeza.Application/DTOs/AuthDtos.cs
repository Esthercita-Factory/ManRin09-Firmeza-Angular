namespace Firmeza.Application.DTOs;

public record LoginRequestDto(string Email, string Password);

public record RegisterEnterpriseDto(
    string BusinessName,
    string TaxId,
    string ContactName,
    string CorporateEmail,
    string CorporatePhone,
    string Password
);

public record RegisterClientDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Password
);
