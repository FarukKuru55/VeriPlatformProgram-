using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeriPlatform.Entities;
using VeriPlatform.Data;
using System.Text.Json;
using System.Security.Claims;

namespace VeriPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormController : ControllerBase
{
    private readonly AppDbContext _db;
    public FormController(AppDbContext db) => _db = db;

    // --- 1. FORM ŞABLONU İŞLEMLERİ ---
    [HttpGet("templates")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTemplates()
    {
        var isAdmin = User.IsInRole("Admin");
        var now = DateTime.UtcNow;
        var query = _db.FormTemplates.AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(t =>
                (t.StartDate == null || t.StartDate <= now) &&
                (t.EndDate == null || t.EndDate >= now)
            );
        }

        return Ok(await query.OrderByDescending(t => t.CreatedAt).ToListAsync());
    }

    [HttpPost("templates")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTemplate([FromBody] FormTemplate template)
    {
        template.StartDate = template.StartDate?.ToUniversalTime();
        template.EndDate = template.EndDate?.ToUniversalTime();
        template.CreatedAt = DateTime.UtcNow;

        _db.FormTemplates.Add(template);
        await _db.SaveChangesAsync();
        return Ok(template);
    }

    [HttpDelete("templates/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        var template = await _db.FormTemplates.FindAsync(id);
        if (template == null) return NotFound();
        _db.FormTemplates.Remove(template);
        await _db.SaveChangesAsync();
        return Ok();
    }

    // --- 2. SORU İŞLEMLERİ ---
    [HttpGet("templates/{formId}/questions")]
    [AllowAnonymous]
    public async Task<IActionResult> GetQuestions(int formId) =>
        Ok(await _db.Questions.Where(q => q.FormTemplateId == formId).OrderBy(q => q.Order).ToListAsync());

    [HttpPost("templates/{formId}/questions")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddQuestion(int formId, [FromBody] QuestionDto dto)
    {
        var maxOrder = await _db.Questions.Where(q => q.FormTemplateId == formId).Select(q => (int?)q.Order).MaxAsync() ?? 0;

        var question = new Question
        {
            FormTemplateId = formId,
            Label = dto.Label,
            Type = dto.Type,
            Order = maxOrder + 1,
            OptionsJson = dto.OptionsJson,
            IsRequired = dto.IsRequired, // 🚀 ZORUNLU ALAN EKLENDİ
            ImageUrl = dto.ImageUrl      // 🚀 GÖRSEL URL EKLENDİ
        };

        _db.Questions.Add(question);
        await _db.SaveChangesAsync();
        return Ok(question);
    }

    [HttpPut("questions/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionDto dto)
    {
        var q = await _db.Questions.FindAsync(id);
        if (q == null) return NotFound();

        q.Label = dto.Label;
        q.Type = dto.Type;
        q.OptionsJson = dto.OptionsJson;
        q.IsRequired = dto.IsRequired; // 🚀 ZORUNLU ALAN GÜNCELLEMESİ EKLENDİ
        q.ImageUrl = dto.ImageUrl;     // 🚀 GÖRSEL URL GÜNCELLEMESİ EKLENDİ

        await _db.SaveChangesAsync();
        return Ok(q);
    }

    [HttpPut("questions/reorder")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reorder([FromBody] List<int> orderedIds)
    {
        var questions = await _db.Questions.ToListAsync();
        for (int i = 0; i < orderedIds.Count; i++)
        {
            var q = questions.FirstOrDefault(x => x.Id == orderedIds[i]);
            if (q != null) q.Order = i + 1;
        }
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("questions/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        var q = await _db.Questions.FindAsync(id);
        if (q == null) return NotFound();
        _db.Questions.Remove(q);
        await _db.SaveChangesAsync();
        return Ok();
    }

    // --- 3. YANIT İŞLEMLERİ ---
    [HttpGet("templates/{formId}/submissions")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetSubmissions(int formId)
    {
        var list = await _db.Submissions
            .Where(s => s.FormTemplateId == formId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPut("submissions/{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSubmissionStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var submission = await _db.Submissions.FindAsync(id);
        if (submission == null) return NotFound();

        if (dto.Status != null) submission.Status = dto.Status;
        if (dto.AdminNote != null) submission.AdminNote = dto.AdminNote;

        await _db.SaveChangesAsync();
        return Ok(submission);
    }

    [HttpPost("templates/{formId}/submit")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitForm(int formId, [FromBody] object answers)
    {
        var submission = new Submission
        {
            FormTemplateId = formId,
            AnswersJson = JsonSerializer.Serialize(answers),
            SubmittedAt = DateTime.UtcNow
        };
        _db.Submissions.Add(submission);

        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdStr, out int userId))
        {
            var assignment = await _db.FormAssignments
                .FirstOrDefaultAsync(fa => fa.UserId == userId && fa.FormTemplateId == formId && !fa.IsCompleted);

            if (assignment != null)
            {
                assignment.IsCompleted = true;
                assignment.CompletedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Yanıtınız kaydedildi ve göreviniz tamamlandı!" });
    }

    // ════════════ 4. GÖREV ATAMA ════════════
    [HttpPost("assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignForm([FromBody] AssignDto dto)
    {
        foreach (var userId in dto.UserIds)
        {
            var exists = await _db.FormAssignments.AnyAsync(fa => fa.UserId == userId && fa.FormTemplateId == dto.FormTemplateId);
            if (!exists)
            {
                _db.FormAssignments.Add(new FormAssignment { UserId = userId, FormTemplateId = dto.FormTemplateId });
            }
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Atama başarılı." });
    }

    [HttpGet("my-tasks")]
    [Authorize]
    public async Task<IActionResult> GetMyTasks()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var tasks = await _db.FormAssignments
            .Where(fa => fa.UserId == userId && !fa.IsCompleted)
            .Include(fa => fa.FormTemplate)
            .Select(fa => new {
                fa.Id,
                fa.FormTemplateId,
                fa.FormTemplate.Title,
                fa.AssignedAt,
                fa.FormTemplate.EndDate
            }).ToListAsync();

        return Ok(tasks);
    }

    // --- 5. DASHBOARD & STATS ---
    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var now = DateTime.UtcNow;

        var totalAssignments = await _db.FormAssignments.CountAsync();
        var completedAssignments = await _db.FormAssignments.CountAsync(fa => fa.IsCompleted);

        var userPerformance = await _db.Users
            .Select(u => new {
                Username = u.Username,
                Total = _db.FormAssignments.Count(fa => fa.UserId == u.Id),
                Done = _db.FormAssignments.Count(fa => fa.UserId == u.Id && fa.IsCompleted)
            })
            .Where(x => x.Total > 0)
            .ToListAsync();

        return Ok(new
        {
            totalForms = await _db.FormTemplates.CountAsync(),
            totalSubmissions = await _db.Submissions.CountAsync(),
            activeForms = await _db.FormTemplates.CountAsync(t => (t.StartDate == null || t.StartDate <= now) && (t.EndDate == null || t.EndDate >= now)),
            dailySubmissions = await _db.Submissions.Where(s => s.SubmittedAt >= now.AddDays(-7)).GroupBy(s => s.SubmittedAt.Date).Select(g => new { Name = g.Key.ToString("dd MMM"), Basvuru = g.Count() }).ToListAsync(),
            topForms = await _db.FormTemplates.Select(t => new { Name = t.Title, Basvuru = t.Submissions.Count }).OrderByDescending(x => x.Basvuru).Take(5).ToListAsync(),
            totalAssignments,
            completedAssignments,
            userPerformance
        });
    }

    [HttpPost("upload")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest();
        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
        var path = Path.Combine(uploads, Guid.NewGuid() + "_" + file.FileName);
        using (var stream = new FileStream(path, FileMode.Create)) { await file.CopyToAsync(stream); }
        return Ok(new { url = $"http://localhost:5062/uploads/{Path.GetFileName(path)}" });
    }
}

// 🚀 DTO SINIFLARI GÜNCELLENDİ
public class QuestionDto
{
    public string Label { get; set; } = "";
    public string Type { get; set; } = "text";
    public string? OptionsJson { get; set; }
    public bool IsRequired { get; set; }    // 🚀 ZORUNLU ALAN İÇİN EKLENDİ
    public string? ImageUrl { get; set; }   // 🚀 GÖRSEL İÇİN EKLENDİ
}

public class UpdateStatusDto
{
    public string? Status { get; set; }
    public string? AdminNote { get; set; }
}

public class AssignDto
{
    public int FormTemplateId { get; set; }
    public List<int> UserIds { get; set; } = new();
}