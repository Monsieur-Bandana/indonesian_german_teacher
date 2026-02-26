using Backend.Models;
using Newtonsoft.Json.Linq;
using Backend.Data;

namespace Backend.Services;

public static class JsonExtractor
{
    public static void Import(AppDbContext _db)
    {
        var path = Path.Combine(Directory.GetCurrentDirectory(), "vocabularies.json");
        string jsonString = File.ReadAllText(path);
        var jArray = JArray.Parse(jsonString);
        foreach (JObject item in jArray)
        {

            List<VocabEntry> germanEntries = CreateObjectList(item, "d");
            List<VocabEntry> indonesianEntries = CreateObjectList(item, "id");

            _db.Vocabs.AddRange(germanEntries);
            _db.Vocabs.AddRange(indonesianEntries);

        }
        _db.SaveChanges();

    }

    static List<VocabEntry> CreateObjectList(JObject obj, string language)
    {
        var counterPart = language == "d" ? "id" : "d";
        List<VocabEntry> vocabEntries = new List<VocabEntry>();
        try
        {
            for (int i = 0; i < obj[counterPart]!.Count(); i++)
            {
                var entry = new VocabEntry();

                for (int y = 0; y < obj[language]!.Count(); y++)
                {
                    entry.Frontside += obj[language]![y]?["v"]?.ToString() + "\n";
                    entry.FrontsideBeforeNote += obj[language]![y]?["before"]?.ToString() ?? "";

                }
                Console.WriteLine(entry.FrontsideBeforeNote);
                Console.WriteLine(entry.Frontside);
                entry.FrontsideAfterNote =
                    obj[counterPart]![i]?["descr"]?.ToString() ?? "";


                entry.Backside = obj[counterPart]![i]?["v"]?.ToString();
                entry.BacksideBeforeNote = obj[counterPart]![i]?["before"]?.ToString() ?? "";
                entry.Languagekey = language;
                entry.hasCopyright = obj["hasCopyright"]?.ToObject<int>() ?? 0;

                vocabEntries.Add(entry);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error parsing JSON: " + ex.Message);
        }
        return vocabEntries;
    }

}