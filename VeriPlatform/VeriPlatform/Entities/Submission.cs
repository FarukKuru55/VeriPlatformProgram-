namespace VeriPlatform.Entities;

public class Submission
{
    public int Id { get; set; }

    public int FormTemplateId { get; set; }
    public FormTemplate FormTemplate { get; set; } = null!;

    public string AnswersJson { get; set; } = null!;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Yeni";
    public string? AdminNote { get; set; }
}