using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<VocabProgress> VocabProgress => Set<VocabProgress>();

    public DbSet<VocabEntry> Vocabs => Set<VocabEntry>();


    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<VocabEntry>(entity =>
        {
            entity.Property(e => e.Frontside).IsRequired();
            entity.Property(e => e.Backside).IsRequired();
            entity.Property(e => e.Languagekey).IsRequired();

            // Falls du CategoryIds als nullable (!) definierst:
            // entity.PrimitiveCollection(e => e.CategoryIds).IsRequired(false);

            // Falls du CategoryIds = new() verwendest, brauchst du hier nix extra.
        });


        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            //  entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.LearningLanguage).IsRequired().HasMaxLength(20);
        });

        modelBuilder.Entity<VocabProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.VocabId }).IsUnique();
            entity.Property(e => e.Interval).IsRequired().HasMaxLength(20);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.VocabProgress)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
