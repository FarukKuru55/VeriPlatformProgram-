using Microsoft.EntityFrameworkCore;
using VeriPlatform.Entities;

namespace VeriPlatform.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<FormTemplate> FormTemplates { get; set; }

    // 🚀 YENİ EKLENEN TABLO: Görev Atamaları
    public DbSet<FormAssignment> FormAssignments => Set<FormAssignment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Composite PK
        builder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        // Görev Atama Kuralı: Bir kullanıcıya aynı form sadece 1 kez atanabilir!
        builder.Entity<FormAssignment>()
            .HasIndex(fa => new { fa.UserId, fa.FormTemplateId })
            .IsUnique();

        // Seed: roller
        builder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "User" }
        );

        // Seed: test kullanıcısı (şifre: "1234")   
        builder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "faruk",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234")
        });

        // Bu kullanıcı hem Admin hem User
        builder.Entity<UserRole>().HasData(
            new UserRole { UserId = 1, RoleId = 1 },
            new UserRole { UserId = 1, RoleId = 2 }
        );
    }
}