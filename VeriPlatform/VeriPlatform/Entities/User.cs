namespace VeriPlatform.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string? Email { get; set; }
    public string PasswordHash { get; set; } = null!;
    public string? ResetCode { get; set; }
    public DateTime? ResetCodeExpires { get; set; }
    public ICollection<FormAssignment> FormAssignments { get; set; } = new List<FormAssignment>();

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
