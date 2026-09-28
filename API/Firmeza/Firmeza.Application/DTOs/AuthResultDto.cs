namespace Firmeza.Application.DTOs;

public record AuthResultDto
{
    public int UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public bool Success { get; init; }
    public string? ErrorMessage { get; init; }

    public AuthResultDto() { }

    public AuthResultDto(int userId, string email, string name, string role, bool success, string? errorMessage = null)
    {
        UserId = userId;
        Email = email;
        Name = name;
        Role = role;
        Success = success;
        ErrorMessage = errorMessage;
    }
}
