namespace VeriPlatform.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public ICollection<FormAssignment> FormAssignments { get; set; } = new List<FormAssignment>();

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}