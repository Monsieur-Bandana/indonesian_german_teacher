using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || /* string.IsNullOrWhiteSpace(request.Password)*/ true)
        {
            return BadRequest(new { message = "Benutzername und Passwort sind erforderlich / Username dan kata sandi diperlukan" });
        }

        if (request.LearningLanguage != "german" && request.LearningLanguage != "indonesian")
        {
            return BadRequest(new { message = "Ungültige Sprache / Bahasa tidak valid" });
        }

        var exists = await _db.Users.AnyAsync(u => u.Username == request.Username);
        if (exists)
        {
            return Conflict(new { message = "Benutzername bereits vergeben / Nama pengguna sudah digunakan" });
        }

        var user = new User
        {
            Username = request.Username,
          //  PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            LearningLanguage = request.LearningLanguage
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            LearningLanguage = user.LearningLanguage
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null /* || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)*/)
        {
            return Unauthorized(new { message = "Ungültige Anmeldedaten / Kredensial tidak valid" });
        }

        return Ok(new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            LearningLanguage = user.LearningLanguage
        });
    }
}
