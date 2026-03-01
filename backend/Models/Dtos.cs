namespace Backend.Models;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
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

public class VocabEntryDto
{
    public int Id { get; set; }
    public string Frontside { get; set; } = string.Empty;
    public string? FrontsideBeforeNote { get; set; }
    public string? FrontsideAfterNote { get; set; }
    public string Backside { get; set; } = string.Empty;
    public string? BetweenLayer { get; set; }
    public string? BacksideBeforeNote { get; set; }
    public string? BacksideAfterNote { get; set; }
    public string Languagekey { get; set; } = string.Empty;
    public int? hasCopyright { get; set; }
    //  public List<int> CategoryIds { get; set; } = new List<int>();
}
