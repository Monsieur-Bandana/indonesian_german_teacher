using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VocabProgressController : ControllerBase
{
    private readonly AppDbContext _db;

    public VocabProgressController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// GET /api/vocabprogress/{userId}
    /// Load all vocabulary progress for a user (called at session start)
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<List<VocabProgressDto>>> GetProgress(int userId)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound(new { message = "Benutzer nicht gefunden / Pengguna tidak ditemukan" });
        }

        var progress = await _db.VocabProgress
            .Where(vp => vp.UserId == userId)
            .Select(vp => new VocabProgressDto
            {
                VocabId = vp.VocabId,
                Interval = vp.Interval,
                Timestamp = vp.Timestamp,
                GreenStreak = vp.GreenStreak
            })
            .ToListAsync();

        return Ok(progress);
    }

    /// <summary>
    /// POST /api/vocabprogress/{userId}
    /// Save session progress - creates new entries or updates existing ones
    /// Called on session end, visibility change, or page unload
    /// </summary>
    [HttpPost("{userId}")]
    public async Task<ActionResult> SaveProgress(int userId, [FromBody] List<VocabProgressDto> entries)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound(new { message = "Benutzer nicht gefunden / Pengguna tidak ditemukan" });
        }

        var existingProgress = await _db.VocabProgress
            .Where(vp => vp.UserId == userId)
            .ToDictionaryAsync(vp => vp.VocabId);

        foreach (var entry in entries)
        {
            if (existingProgress.TryGetValue(entry.VocabId, out var existing))
            {
                // Update existing entry
                existing.Interval = entry.Interval;
                existing.Timestamp = entry.Timestamp;
                existing.GreenStreak = entry.GreenStreak;
            }
            else
            {
                // Create new entry
                _db.VocabProgress.Add(new VocabProgress
                {
                    UserId = userId,
                    VocabId = entry.VocabId,
                    Interval = entry.Interval,
                    Timestamp = entry.Timestamp,
                    GreenStreak = entry.GreenStreak
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Fortschritt gespeichert / Kemajuan disimpan" });
    }
}
