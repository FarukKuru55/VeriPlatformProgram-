using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VeriPlatform.Data;
using VeriPlatform.Entities;

namespace VeriPlatform.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config; // JWT Token üretmek için gerekli ayarlar

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // --- DTO SINIFLARI ---
    public class RegisterDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class LoginDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }


    // ════════════ 1. GİRİŞ YAPMA (LOGIN) ════════════
    [HttpPost("login")]
    [AllowAnonymous] // Herkes giriş yapmayı deneyebilir
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // 1. Kullanıcıyı bul
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        // 2. Kullanıcı yoksa veya Şifre Hatalıysa (BCrypt ile şifreyi çözüp doğruluyoruz!)
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Kullanıcı adı veya şifre hatalı.");

        // 3. Kullanıcının rollerini bul (Senin UserRoles tablon üzerinden)
        var userRoleIds = await _db.UserRoles.Where(ur => ur.UserId == user.Id).Select(ur => ur.RoleId).ToListAsync();
        var roleNames = await _db.Roles.Where(r => userRoleIds.Contains(r.Id)).Select(r => r.Name).ToListAsync();

        // 4. Token İçine Konulacak Bilgiler (Kimlik Kartı)
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        // Rolleri Token'a ekle
        foreach (var role in roleNames)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // 5. JWT Token Üretimi (appsettings.json'dan verileri çeker)
        var keyString = _config["Jwt:Key"] ?? "super_gizli_cok_uzun_bir_key_yazmaliyiz_buraya_12345";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(1), // Token 1 gün geçerli
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new { token = tokenString });
    }


    // ════════════ 2. YENİ YETKİLİ EKLEME (REGISTER/PROMOTE) ════════════
    [HttpPost("register")]
    [Authorize(Roles = "Admin")] // Sadece mevcut Adminler bu işlemi yapabilir
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Kullanıcı adı ve şifre boş olamaz.");

        var adminRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        if (adminRole == null) return StatusCode(500, "Sistemde 'Admin' rolü tanımlı değil.");

        var existingUser = await _db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (existingUser != null)
        {
            bool isAdmin = existingUser.UserRoles.Any(ur => ur.RoleId == adminRole.Id);
            if (isAdmin) return BadRequest("Bu kullanıcı zaten Admin yetkisine sahip!");

            existingUser.UserRoles.Add(new UserRole { RoleId = adminRole.Id });
            await _db.SaveChangesAsync();
            return Ok(new { message = $"'{existingUser.Username}' adlı mevcut kullanıcı Admin yapıldı." });
        }
        else
        {
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = passwordHash,
                UserRoles = new List<UserRole> { new UserRole { RoleId = adminRole.Id } }
            };

            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();
            return Ok(new { message = $"'{dto.Username}' adında yeni bir Admin oluşturuldu." });
        }
    }
    // ════════════ 2B. HERKESE AÇIK KAYIT (PUBLIC REGISTER) ════════════
    [HttpPost("register-public")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterPublic([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Kullanıcı adı ve şifre boş olamaz.");

        if (dto.Password.Length < 4)
            return BadRequest("Şifre en az 4 karakter olmalıdır.");

        var userRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null) return StatusCode(500, "Sistemde 'User' rolü tanımlı değil.");

        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (existingUser != null)
            return BadRequest("Bu kullanıcı adı zaten kullanılmaktadır.");

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var newUser = new User
        {
            Username = dto.Username,
            PasswordHash = passwordHash,
            UserRoles = new List<UserRole> { new UserRole { RoleId = userRole.Id } }
        };

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Kayıt başarılı! Şimdi giriş yapabilirsiniz." });
    }

    // ════════════ 3. TÜM KULLANICILARI LİSTELE ════════════
    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var adminRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");

        var users = await _db.Users
            .Include(u => u.UserRoles)
            .Select(u => new
            {
                u.Id,
                u.Username,
                IsAdmin = adminRole != null && u.UserRoles.Any(ur => ur.RoleId == adminRole.Id)
            })
            .ToListAsync();

        return Ok(users);
    }

    // ════════════ 4. YETKİ VER / YETKİ AL (TOGGLE ROLE) ════════════
    [HttpPut("users/{id}/toggle-admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleAdmin(int id)
    {
        var adminRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        if (adminRole == null) return StatusCode(500, "Sistemde Admin rolü bulunamadı.");

        var user = await _db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        // Kullanıcı kendi kendini yetkisiz bırakamasın (Ayağına sıkmasın diye koruma)
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == id.ToString())
            return BadRequest("Kendi admin yetkinizi alamazsınız!");

        var existingRole = user.UserRoles.FirstOrDefault(ur => ur.RoleId == adminRole.Id);

        if (existingRole != null)
        {
            // Adam zaten adminmiş, rütbesini söküyoruz (Sil)
            user.UserRoles.Remove(existingRole);
            await _db.SaveChangesAsync();
            return Ok(new { message = $"'{user.Username}' adlı kullanıcının Admin yetkisi alındı.", isAdmin = false });
        }
        else
        {
            // Normal kullanıcıymış, Admin apoleti takıyoruz (Ekle)
            user.UserRoles.Add(new UserRole { RoleId = adminRole.Id });
            await _db.SaveChangesAsync();
            return Ok(new { message = $"'{user.Username}' adlı kullanıcı Admin yapıldı.", isAdmin = true });
        }
    }

    // ════════════ 5. KULLANICIYI SİSTEMDEN TAMAMEN SİL ════════════
    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == id.ToString())
            return BadRequest("Kendi hesabınızı silemezsiniz!");

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Kullanıcı sistemden tamamen silindi." });
    }
}