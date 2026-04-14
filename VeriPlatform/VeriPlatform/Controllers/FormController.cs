using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using VeriPlatform.Entities;
using VeriPlatform.Data;
using VeriPlatform.Hubs;
using System.Text.Json;
using System.Security.Claims;
using System.Globalization;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;

namespace VeriPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<NotificationHub> _hubContext;
    public FormController(AppDbContext db, IHubContext<NotificationHub> hubContext) 
    { 
        _db = db; 
        _hubContext = hubContext;
    }

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
        if (dto.FormTemplateId <= 0)
            return BadRequest("Geçersiz FormTemplateId: " + dto.FormTemplateId);
        
        if (dto.UserIds == null || !dto.UserIds.Any())
            return BadRequest("UserIds boş veya null");

        var formExists = await _db.FormTemplates.AnyAsync(t => t.Id == dto.FormTemplateId);
        if (!formExists)
            return BadRequest("FormTemplate bulunamadı");

        foreach (var userId in dto.UserIds)
        {
            if (userId <= 0) continue;

            var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
            if (!userExists) continue;

            var exists = await _db.FormAssignments.AnyAsync(fa => fa.UserId == userId && fa.FormTemplateId == dto.FormTemplateId);
            if (!exists)
            {
                var assignment = new FormAssignment { UserId = userId, FormTemplateId = dto.FormTemplateId };
                _db.FormAssignments.Add(assignment);
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
        
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized("Token'da userId bulunamadı");

        if (!int.TryParse(userIdStr, out int userId)) 
            return Unauthorized("Geçersiz userId: " + userIdStr);

        var allAssignments = await _db.FormAssignments.ToListAsync();
        var userAssignments = allAssignments.Where(fa => fa.UserId == userId).ToList();

        var assignments = await _db.FormAssignments
            .Where(fa => fa.UserId == userId && !fa.IsCompleted)
            .Include(fa => fa.FormTemplate)
            .ToListAsync();

        var tasks = assignments
            .Where(fa => fa.FormTemplate != null)
            .Select(fa => new {
                fa.Id,
                fa.FormTemplateId,
                fa.FormTemplate!.Title,
                fa.AssignedAt,
                fa.FormTemplate.EndDate
            }).ToList();

        return Ok(tasks);
    }

    [HttpGet("user-analytics/{userId?}")]
    [Authorize]
    public async Task<IActionResult> GetUserAnalytics(int? userId)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int currentUserId))
            return Unauthorized("Geçersiz kullanıcı");

        var isAdmin = User.IsInRole("Admin");
        int targetUserId;

        if (!isAdmin)
        {
            targetUserId = currentUserId;
        }
        else if (userId == null)
        {
            targetUserId = currentUserId;
        }
        else
        {
            targetUserId = userId.Value;
        }

        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30).Date;
        var today = DateTime.UtcNow.Date;

        var assignments = await _db.FormAssignments
            .Where(fa => fa.UserId == targetUserId)
            .Include(fa => fa.FormTemplate)
            .ToListAsync();

        var recentAssignments = assignments.Where(a => a.AssignedAt >= thirtyDaysAgo).ToList();

        var dailyData = new List<object>();
        var totalCompleted = 0;
        var totalMissed = 0;

        for (var date = thirtyDaysAgo; date <= today; date = date.AddDays(1))
        {
            var dayAssignments = recentAssignments.Where(a => a.AssignedAt.Date == date).ToList();
            var dayCompleted = dayAssignments.Count(a => a.IsCompleted);
            var dayAssigned = dayAssignments.Count;
            
            totalCompleted += dayCompleted;
            totalMissed += dayAssigned - dayCompleted;

            var formTitles = dayAssignments
                .Where(a => a.FormTemplate != null)
                .Select(a => a.FormTemplate!.Title)
                .Distinct()
                .ToList();

            dailyData.Add(new {
                Date = date.ToString("yyyy-MM-dd"),
                DayName = date.ToString("dd MMM", CultureInfo.GetCultureInfo("tr-TR")),
                DayOfWeek = date.DayOfWeek.ToString(),
                Assigned = dayAssigned,
                Completed = dayCompleted,
                Missed = Math.Max(0, dayAssigned - dayCompleted),
                Pending = dayAssigned > 0 && !dayAssignments.All(a => a.IsCompleted) ? dayAssigned - dayCompleted : 0,
                FormTitles = formTitles
            });
        }

        var totalAssigned = recentAssignments.Count;
        var completionRate = totalAssigned > 0 ? Math.Round((double)totalCompleted / totalAssigned * 100, 1) : 0;

        var weeklyData = Enumerable.Range(0, 4).Select(weekIndex => {
            var weekStart = today.AddDays(-(weekIndex + 1) * 7);
            var weekEnd = today.AddDays(-weekIndex * 7);
            var weekAssignments = recentAssignments.Where(a => a.AssignedAt >= weekStart && a.AssignedAt < weekEnd).ToList();
            var weekCompleted = weekAssignments.Count(a => a.IsCompleted);
            return new {
                WeekLabel = $"{weekIndex + 1}. Hafta",
                Completed = weekCompleted,
                Assigned = weekAssignments.Count,
                CompletionRate = weekAssignments.Count > 0 ? Math.Round((double)weekCompleted / weekAssignments.Count * 100, 1) : 0
            };
        }).Reverse().ToList();

        return Ok(new {
            userId = targetUserId,
            dailyData,
            summary = new {
                totalAssigned,
                totalCompleted,
                totalMissed = Math.Max(0, totalMissed),
                completionRate,
                last30Days = new {
                    completed = totalCompleted,
                    missed = Math.Max(0, totalMissed)
                }
            },
            weeklyData
        });
    }

    [HttpGet("debug/assignments")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllAssignments()
    {
        var assignments = await _db.FormAssignments
            .Include(fa => fa.FormTemplate)
            .Include(fa => fa.User)
            .ToListAsync();
        
        return Ok(assignments.Select(a => new {
            a.Id,
            a.UserId,
            Username = a.User?.Username,
            a.FormTemplateId,
            FormTitle = a.FormTemplate?.Title,
            a.IsCompleted,
            a.AssignedAt
        }));
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

        var submissionsByStatus = await _db.Submissions
            .GroupBy(s => s.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var rawSubmissionsByDate = await _db.Submissions
            .Where(s => s.SubmittedAt >= now.AddDays(-30))
            .GroupBy(s => s.SubmittedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();
        var submissionsByDate = rawSubmissionsByDate
            .OrderBy(x => x.Date)
            .Select(x => new { Date = x.Date.ToString("yyyy-MM-dd"), x.Count })
            .ToList();

        var formStatusBreakdown = await _db.FormTemplates
            .Select(t => new {
                Title = t.Title,
                Active = (t.StartDate == null || t.StartDate <= now) && (t.EndDate == null || t.EndDate >= now),
                Submissions = t.Submissions.Count,
                Questions = _db.Questions.Count(q => q.FormTemplateId == t.Id)
            })
            .ToListAsync();

        var rawDailySubmissions = await _db.Submissions
            .Where(s => s.SubmittedAt >= now.AddDays(-7))
            .GroupBy(s => s.SubmittedAt.Date)
            .Select(g => new { Date = g.Key, Basvuru = g.Count() })
            .ToListAsync();

        var dailySubmissions = rawDailySubmissions
            .Select(x => new { Name = x.Date.ToString("dd MMM"), x.Basvuru })
            .ToList();

        return Ok(new
        {
            totalForms = await _db.FormTemplates.CountAsync(),
            totalSubmissions = await _db.Submissions.CountAsync(),
            totalUsers = await _db.Users.CountAsync(),
            activeForms = await _db.FormTemplates.CountAsync(t => (t.StartDate == null || t.StartDate <= now) && (t.EndDate == null || t.EndDate >= now)),
            expiredForms = await _db.FormTemplates.CountAsync(t => t.EndDate != null && t.EndDate < now),
            pendingForms = await _db.FormTemplates.CountAsync(t => t.StartDate != null && t.StartDate > now),
            dailySubmissions,
            topForms = await _db.FormTemplates.Select(t => new { Name = t.Title, Basvuru = t.Submissions.Count }).OrderByDescending(x => x.Basvuru).Take(5).ToListAsync(),
            totalAssignments,
            completedAssignments,
            pendingAssignments = totalAssignments - completedAssignments,
            completionRate = totalAssignments > 0 ? Math.Round((double)completedAssignments / totalAssignments * 100, 1) : 0,
            submissionsByStatus,
            submissionsByDate,
            formStatusBreakdown,
            userPerformance
        });
    }

    [HttpGet("admin-summary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminSummary()
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30).Date;

        var allUsers = await _db.Users
            .Where(u => u.Username != "admin")
            .ToListAsync();

        var userStats = new List<object>();
        foreach (var user in allUsers)
        {
            var userAssignments = await _db.FormAssignments
                .Where(fa => fa.UserId == user.Id)
                .ToListAsync();

            var recentAssignments = userAssignments.Where(a => a.AssignedAt >= thirtyDaysAgo).ToList();
            var totalAssigned = userAssignments.Count;
            var totalCompleted = userAssignments.Count(a => a.IsCompleted);
            var recentCompleted = recentAssignments.Count(a => a.IsCompleted);
            var recentMissed = recentAssignments.Count(a => !a.IsCompleted && a.FormTemplate.EndDate != null && a.FormTemplate.EndDate < now);

            userStats.Add(new
            {
                userId = user.Id,
                username = user.Username,
                fullName = user.Username,
                totalAssigned,
                totalCompleted,
                completionRate = totalAssigned > 0 ? Math.Round((double)totalCompleted / totalAssigned * 100, 1) : 0,
                recentAssigned = recentAssignments.Count,
                recentCompleted,
                recentMissed,
                recentCompletionRate = recentAssignments.Count > 0 
                    ? Math.Round((double)recentCompleted / recentAssignments.Count * 100, 1) 
                    : 0
            });
        }

        var systemStats = new
        {
            totalUsers = allUsers.Count,
            totalForms = await _db.FormTemplates.CountAsync(),
            totalAssignments = await _db.FormAssignments.CountAsync(),
            totalSubmissions = await _db.Submissions.CountAsync(),
            activeForms = await _db.FormTemplates.CountAsync(t => (t.StartDate == null || t.StartDate <= now) && (t.EndDate == null || t.EndDate >= now)),
            overallCompletionRate = await _db.FormAssignments.CountAsync() > 0 
                ? Math.Round((double)await _db.FormAssignments.CountAsync(a => a.IsCompleted) / await _db.FormAssignments.CountAsync() * 100, 1)
                : 0
        };

        return Ok(new
        {
            systemStats,
            userStats
        });
    }

    // --- 6. EXPORT ---
    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportData([FromQuery] string format = "xlsx")
    {
        var submissions = await _db.Submissions
            .Include(s => s.FormTemplate)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var questions = await _db.Questions.ToListAsync();

        if (format.ToLower() == "csv")
        {
            var csvData = submissions.Select(s => {
                var answers = new Dictionary<string, string>();
                try {
                    var parsed = JsonSerializer.Deserialize<Dictionary<string, object>>(s.AnswersJson);
                    if (parsed != null) {
                        foreach (var q in questions.Where(q => q.FormTemplateId == s.FormTemplateId)) {
                            var key = q.Id.ToString();
                            answers[$"Soru_{q.Order}"] = parsed.ContainsKey(key) ? parsed[key]?.ToString() ?? "" : "";
                        }
                    }
                } catch { }

                var baseDict = new Dictionary<string, object> {
                    { "YanitID", s.Id },
                    { "FormAdi", s.FormTemplate?.Title ?? "Bilinmeyen" },
                    { "Tarih", s.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss") },
                    { "Durum", s.Status },
                    { "YoneticiNotu", s.AdminNote ?? "" }
                };

                foreach (var ans in answers) {
                    baseDict[ans.Key] = ans.Value;
                }

                return baseDict;
            }).ToList();

            using var memoryStream = new MemoryStream();
            using var writer = new StreamWriter(memoryStream);
            using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture));
            
            if (csvData.Any()) {
                foreach (var header in csvData.First().Keys) {
                    csv.WriteField(header);
                }
                csv.NextRecord();
                
                foreach (var row in csvData) {
                    foreach (var value in row.Values) {
                        csv.WriteField(value?.ToString() ?? "");
                    }
                    csv.NextRecord();
                }
            }
            
            writer.Flush();
            return File(memoryStream.ToArray(), "text/csv", $"veri_yanitlari_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }

        var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Yanıtlar");

        ws.Cell(1, 1).Value = "Yanıt ID";
        ws.Cell(1, 2).Value = "Form Adı";
        ws.Cell(1, 3).Value = "Tarih";
        ws.Cell(1, 4).Value = "Durum";
        ws.Cell(1, 5).Value = "Yönetici Notu";

        var headers = new List<string> { "Yanıt ID", "Form Adı", "Tarih", "Durum", "Yönetici Notu" };
        var qIndex = 6;

        var templateIds = submissions.Select(s => s.FormTemplateId).Distinct().ToList();
        foreach (var templateId in templateIds) {
            var templateQuestions = questions.Where(q => q.FormTemplateId == templateId).OrderBy(q => q.Order).ToList();
            foreach (var q in templateQuestions) {
                var colHeader = $"Soru_{q.Order}";
                ws.Cell(1, qIndex).Value = colHeader;
                headers.Add(colHeader);
                qIndex++;
            }
            if (templateQuestions.Any()) break;
        }

        ws.Range(1, 1, 1, headers.Count).Style.Font.Bold = true;
        ws.Range(1, 1, 1, headers.Count).Style.Fill.BackgroundColor = XLColor.LightGray;
        ws.Range(1, 1, 1, headers.Count).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        var rowNum = 2;
        foreach (var s in submissions) {
            ws.Cell(rowNum, 1).Value = s.Id;
            ws.Cell(rowNum, 2).Value = s.FormTemplate?.Title ?? "Bilinmeyen";
            ws.Cell(rowNum, 3).Value = s.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss");
            ws.Cell(rowNum, 4).Value = s.Status;
            ws.Cell(rowNum, 5).Value = s.AdminNote ?? "";

            try {
                var parsed = JsonSerializer.Deserialize<Dictionary<string, object>>(s.AnswersJson);
                if (parsed != null) {
                    var col = 6;
                    var templateQuestions = questions.Where(q => q.FormTemplateId == s.FormTemplateId).OrderBy(q => q.Order).ToList();
                    foreach (var q in templateQuestions) {
                        var key = q.Id.ToString();
                        var val = parsed.ContainsKey(key) ? parsed[key]?.ToString() ?? "" : "";
                        ws.Cell(rowNum, col).Value = val;
                        col++;
                    }
                }
            } catch { }

            rowNum++;
        }

        ws.Columns().AdjustToContents();
        
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return File(ms.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"veri_yanitlari_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
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

    // --- 7. AÇIK FORM PAYLAŞIMI ---
    [HttpPost("templates/{id}/share")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GenerateShareLink(int id)
    {
        var form = await _db.FormTemplates.FindAsync(id);
        if (form == null) return NotFound();

        if (string.IsNullOrEmpty(form.ShareSlug))
        {
            form.ShareSlug = Guid.NewGuid().ToString("N");
            await _db.SaveChangesAsync();
        }

        return Ok(new { slug = form.ShareSlug, url = $"http://localhost:5173/f/{form.ShareSlug}" });
    }

    [HttpGet("public/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicForm(string slug)
    {
        var form = await _db.FormTemplates
            .Where(t => t.ShareSlug == slug)
            .FirstOrDefaultAsync();

        if (form == null) return NotFound(new { message = "Form bulunamadı." });

        var questions = await _db.Questions
            .Where(q => q.FormTemplateId == form.Id)
            .OrderBy(q => q.Order)
            .ToListAsync();

        return Ok(new {
            form.Id,
            form.Title,
            form.Description,
            Questions = questions
        });
    }

    [HttpPost("public/submit")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitPublicForm([FromBody] PublicSubmitDto dto)
    {
        var form = await _db.FormTemplates
            .Where(t => t.ShareSlug == dto.Slug)
            .FirstOrDefaultAsync();

        if (form == null) return NotFound(new { message = "Form bulunamadı." });

        var submission = new Submission
        {
            FormTemplateId = form.Id,
            AnswersJson = JsonSerializer.Serialize(dto.Answers),
            SubmittedAt = DateTime.UtcNow
        };
        _db.Submissions.Add(submission);
        await _db.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
        {
            type = "new_submission",
            formTitle = form.Title,
            submissionId = submission.Id,
            submittedAt = submission.SubmittedAt
        });

        return Ok(new { message = "Teşekkürler, yanıtınız alındı!" });
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

public class PublicSubmitDto
{
    public string Slug { get; set; } = "";
    public Dictionary<string, object> Answers { get; set; } = new();
}