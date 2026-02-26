using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Auto-create database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    JsonExtractor.Import(db);
}

app.UseCors();
app.MapControllers();

app.Run();

/* C sharp Programm schreiben. Dieses ließt das JSON aus.

Schritte:
1. JSON öffnen und lesen
2. Überprüfen, welche Objekte schon mit "data: 1" gelabeled wurden
3. Wenn nicht gelabeled, dann in die Datenbank einfügen (ControllerCreate Command)
4. Die Vokabeln werden in zwei verschiedene Tabellen eingetragen für deutsch und indonesisch.
5. Dann mit data: 1 labeln

*/