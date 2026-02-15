namespace Backend.Models;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string LearningLanguage { get; set; } = string.Empty;
}

public class UserResponse
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string LearningLanguage { get; set; } = string.Empty;
}

public class VocabProgressDto
{
    public int VocabId { get; set; }
    public string Interval { get; set; } = string.Empty;
    public long Timestamp { get; set; }
    public int GreenStreak { get; set; }
}
