namespace Backend.Models;

public class VocabProgress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int VocabId { get; set; }

    public string LearningLanguage { get; set; } = string.Empty;

    /// <summary>
    /// Interval key: "red" (2min), "orange" (5min), "green" (10min),
    /// "day1", "day2", "day4", "day8"
    /// </summary>
    public string Interval { get; set; } = string.Empty;

    /// <summary>
    /// Unix timestamp in milliseconds of last review
    /// </summary>
    public long Timestamp { get; set; }

    /// <summary>
    /// Number of consecutive green ratings (for escalation)
    /// </summary>
    public int GreenStreak { get; set; }

    public User User { get; set; } = null!;
}
