namespace VeriPlatform.Entities;

public class FormTemplate
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public PeriodType PeriodType { get; set; } = PeriodType.Daily;

    public string? ShareSlug { get; set; }

    public List<Question> Questions { get; set; } = new();
    public List<Submission> Submissions { get; set; } = new();
    public List<FormAssignment> FormAssignments { get; set; } = new();
}
