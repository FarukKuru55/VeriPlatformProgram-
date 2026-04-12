namespace VeriPlatform.Entities;

public class FormTemplate
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string? RecurrenceType { get; set; }

    public List<Question> Questions { get; set; } = new();
    public List<Submission> Submissions { get; set; } = new();
}