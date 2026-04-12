using System;

namespace VeriPlatform.Entities;

public class FormAssignment
{
    public int Id { get; set; }

    // Kime atandı?
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Hangi form atandı?
    public int FormTemplateId { get; set; }
    public FormTemplate FormTemplate { get; set; } = null!;

    // Doldurdu mu?
    public bool IsCompleted { get; set; } = false;

    // Atama ve Tamamlanma Zamanları
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}