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

    [HttpGet("{language}")]
    public async Task<ActionResult<List<VocabProgressDto>>> GetProgress(string language)
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

