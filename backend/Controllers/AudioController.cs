using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AudioController : ControllerBase
{
    private readonly string _audioDir;

    public AudioController(IWebHostEnvironment env)
    {
        _audioDir = Path.Combine(env.ContentRootPath, "AudioFiles");
        if (!Directory.Exists(_audioDir))
        {
            Directory.CreateDirectory(_audioDir);
        }
    }

    /// <summary>
    /// GET /api/audio/check/{vocabId}/{lang}
    /// Check if an audio file exists for a vocab/language combination.
    /// lang: "d" (German) or "i" (Indonesian)
    /// Returns { exists: true/false }
    /// </summary>
    [HttpGet("check/{vocabId}/{lang}")]
    public ActionResult CheckAudio(int vocabId, string lang)
    {
        if (lang != "d" && lang != "i")
        {
            return BadRequest(new { message = "Sprache muss 'd' oder 'i' sein / Bahasa harus 'd' atau 'i'" });
        }

        var fileName = $"{vocabId}{lang}.webm";
        var filePath = Path.Combine(_audioDir, fileName);
        return Ok(new { exists = System.IO.File.Exists(filePath) });
    }

    /// <summary>
    /// GET /api/audio/{vocabId}/{lang}
    /// Stream the audio file for playback.
    /// </summary>
    [HttpGet("{vocabId}/{lang}")]
    public ActionResult GetAudio(int vocabId, string lang)
    {
        if (lang != "d" && lang != "i")
        {
            return BadRequest(new { message = "Sprache muss 'd' oder 'i' sein / Bahasa harus 'd' atau 'i'" });
        }

        var fileName = $"{vocabId}{lang}.webm";
        var filePath = Path.Combine(_audioDir, fileName);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = "Audiodatei nicht gefunden / File audio tidak ditemukan" });
        }

        var stream = System.IO.File.OpenRead(filePath);
        return File(stream, "audio/webm", fileName);
    }

    /// <summary>
    /// POST /api/audio/{vocabId}/{lang}
    /// Upload a new audio recording. Accepts multipart/form-data with an "audio" file field.
    /// Overwrites any existing file (for quality improvement).
    /// </summary>
    [HttpPost("{vocabId}/{lang}")]
    public async Task<ActionResult> UploadAudio(int vocabId, string lang, IFormFile audio)
    {
        if (lang != "d" && lang != "i")
        {
            return BadRequest(new { message = "Sprache muss 'd' oder 'i' sein / Bahasa harus 'd' atau 'i'" });
        }

        if (audio == null || audio.Length == 0)
        {
            return BadRequest(new { message = "Keine Audiodatei gesendet / Tidak ada file audio yang dikirim" });
        }

        // Limit file size to 5MB
        if (audio.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "Datei zu groß (max 5MB) / File terlalu besar (maks 5MB)" });
        }

        var fileName = $"{vocabId}{lang}.webm";
        var filePath = Path.Combine(_audioDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await audio.CopyToAsync(stream);

        return Ok(new { message = "Audio gespeichert / Audio disimpan", fileName });
    }
}
