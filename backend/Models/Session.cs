namespace Backend.Models;

public class Session
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string SessionTokenHash { get; set; } = string.Empty;

    public DateOnly CreatedAt { get; set; }

    public DateOnly ExpiredAt { get; set; }

    public DateOnly RevokedAt { get; set; }
}