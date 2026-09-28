namespace Firmeza.Domain.Entities;

public class Enterprise
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string TaxId { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string CorporateEmail { get; set; } = string.Empty;
    public string CorporatePhone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Relación uno a muchos con Client
    public ICollection<Client> Clients { get; set; } = new List<Client>();
}