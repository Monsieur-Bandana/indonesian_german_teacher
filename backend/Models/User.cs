namespace Backend.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
  //  public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// "german" = user is learning German (UI in Indonesian)
    /// "indonesian" = user is learning Indonesian (UI in German)
    /// </summary>
    public string LearningLanguage { get; set; } = string.Empty;

    public ICollection<VocabProgress> VocabProgress { get; set; } = new List<VocabProgress>();
}
