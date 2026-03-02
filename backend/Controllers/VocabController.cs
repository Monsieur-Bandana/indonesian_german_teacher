using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VocabController : ControllerBase
{

    private readonly AppDbContext _db;

    public VocabController(AppDbContext db)
    {
        _db = db;
    }

    // get VocabChunk (List)
    // für später: outer join by id, wenn entry bereits gelernt

    // get VocabChunk by Cagegory

    [HttpPost]
    public async Task<ActionResult> SaveProgress(int userId, [FromBody] List<VocabProgressDto> entries)
    {

        foreach (var entry in entries)
        {


            // Create new entry
            _db.Vocabs.Add(new VocabEntry
            {

            });

        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Fortschritt gespeichert / Kemajuan disimpan" });
    }

    [HttpGet("{id}/{language}")]
    public async Task<ActionResult<List<VocabProgressDto>>> GetVocabsByProgress(int id, string language)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var progresses = await _db.VocabProgress
            .Where(vp => vp.UserId == id
                && (
                    vp.Interval != "green"
                    || vp.Timestamp.AddDays(vp.GreenStreak) == today
                )
            )
            .ToListAsync();

        var vocabIds = progresses
            .Select(p => p.VocabId)
            .ToList();

        var vocabs = await _db.Vocabs.Where(v => v.Languagekey == language && vocabIds.Contains(v.Id))
            .Select(vp => new VocabEntryDto
            {
                Id = vp.Id,
                Frontside = vp.Frontside,
                FrontsideBeforeNote = vp.FrontsideBeforeNote,
                FrontsideAfterNote = vp.FrontsideAfterNote,
                Backside = vp.Backside,
                BetweenLayer = vp.BetweenLayer,
                BacksideBeforeNote = vp.BacksideBeforeNote,
                BacksideAfterNote = vp.BacksideAfterNote,
                Languagekey = vp.Languagekey,
                hasCopyright = vp.hasCopyright
            })
            .ToListAsync();

        var batchSize = 25;
        int vocabsLeft = batchSize - vocabs.Count;

        var newVocabs = await _db.Vocabs
            .Where(v => v.Languagekey == language
                && !_db.VocabProgress
                    .Any(vp => vp.UserId == id && vp.VocabId == v.Id)
            )
            .Take(vocabsLeft)
            .Select(v => new VocabEntryDto
            {
                Id = v.Id,
                Frontside = v.Frontside,
                FrontsideBeforeNote = v.FrontsideBeforeNote,
                FrontsideAfterNote = v.FrontsideAfterNote,
                Backside = v.Backside,
                BetweenLayer = v.BetweenLayer,
                BacksideBeforeNote = v.BacksideBeforeNote,
                BacksideAfterNote = v.BacksideAfterNote,
                Languagekey = v.Languagekey,
                hasCopyright = v.hasCopyright
            })
            .ToListAsync();

        vocabs.AddRange(newVocabs);

        return Ok(vocabs);
    }

    [HttpGet("recordVocabs/{lang}")]
    public async Task<ActionResult<List<VocabRecordDto>>> GetVocabsForRecording(string lang)
    {
        var language = lang == "d" ? "in" : "d";
        var newVocabsForRecord = await _db.Vocabs
            .Where(v => v.Languagekey == language
                && v.IsRecorded == 0)
            .Take(15)
            .Select(v => new VocabRecordDto
            {
                Id = v.Id,
                Frontside = v.Backside
            })
            .ToListAsync();

        return Ok(newVocabsForRecord);
    }

    [HttpGet("new/{language}")]
    public async Task<ActionResult<List<VocabProgressDto>>> GetNew(string language)
    {

        var vocabs = await _db.Vocabs.Where(v => v.Languagekey == language)
            .Select(vp => new VocabEntryDto
            {
                Id = vp.Id,
                Frontside = vp.Frontside,
                FrontsideBeforeNote = vp.FrontsideBeforeNote,
                FrontsideAfterNote = vp.FrontsideAfterNote,
                Backside = vp.Backside,
                BetweenLayer = vp.BetweenLayer,
                BacksideBeforeNote = vp.BacksideBeforeNote,
                BacksideAfterNote = vp.BacksideAfterNote,
                Languagekey = vp.Languagekey,
                hasCopyright = vp.hasCopyright
            })
            .ToListAsync();

        return Ok(vocabs);
    }
}

