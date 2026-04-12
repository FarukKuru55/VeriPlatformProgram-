namespace VeriPlatform.DTOs;

// IsRequired ve ImageUrl alanları buraya da eklendi
public record QuestionDto(
    string Label,
    string Type,
    string? OptionsJson,
    bool IsRequired,
    string? ImageUrl
);