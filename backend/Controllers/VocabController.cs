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
}
