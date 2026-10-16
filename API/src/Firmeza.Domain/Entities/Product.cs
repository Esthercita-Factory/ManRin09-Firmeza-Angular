namespace Firmeza.Domain.Entities;

public class Product
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public string CategoryDetail { get; set; } = "Industrial";
    public string Location { get; set; } = "Nave A-P01-R1";
    public int StockTotal { get; set; }
    public int StockReserved { get; set; }
    public int StockAvailable => Math.Max(0, StockTotal - StockReserved);
    public string CostPrice { get; set; } = "$0.00";
    public string SalePrice { get; set; } = "$0.00";
    public string LastMovement { get; set; } = "Reciente";
    public string ImageIcon { get; set; } = "📦";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}