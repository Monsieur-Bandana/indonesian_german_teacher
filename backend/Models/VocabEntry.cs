namespace Backend.Models;

using System.ComponentModel.DataAnnotations.Schema;
public class VocabEntry
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


}
