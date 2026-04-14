namespace VeriPlatform.Entities;

public class Question
{
    public int Id { get; set; }
    public int FormTemplateId { get; set; }
    public FormTemplate FormTemplate { get; set; } = null!;

    public string Label { get; set; } = null!;

    // "text" | "number" | "date" | "money" | "currency" | "radio" | "checkbox" | "image" | "file"
    public string Type { get; set; } = null!;
    public int Order { get; set; }

    // radio/checkbox için seçenekler JSON olarak tutulur
    public string? OptionsJson { get; set; }

    // 🚀 YENİ: Sorunun zorunlu olup olmadığını tutar
    public bool IsRequired { get; set; } = false;

    // 🚀 YENİ: Sorunun kendi görseli (Daha önce eklemiştik, kaybolmasın)
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}