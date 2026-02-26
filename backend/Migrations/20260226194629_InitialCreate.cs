using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    LabelName = table.Column<string>(type: "TEXT", nullable: false),
                    germanName = table.Column<string>(type: "TEXT", nullable: false),
                    indonesianName = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LearningLanguage = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Vocabs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Frontside = table.Column<string>(type: "TEXT", nullable: false),
                    FrontsideBeforeNote = table.Column<string>(type: "TEXT", nullable: true),
                    FrontsideAfterNote = table.Column<string>(type: "TEXT", nullable: true),
                    Backside = table.Column<string>(type: "TEXT", nullable: false),
                    BacksideBeforeNote = table.Column<string>(type: "TEXT", nullable: true),
                    BacksideAfterNote = table.Column<string>(type: "TEXT", nullable: true),
                    Languagekey = table.Column<string>(type: "TEXT", nullable: false),
                    hasCopyright = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vocabs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VocabProgress",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    VocabId = table.Column<int>(type: "INTEGER", nullable: false),
                    LearningLanguage = table.Column<string>(type: "TEXT", nullable: false),
                    Interval = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Timestamp = table.Column<long>(type: "INTEGER", nullable: false),
                    GreenStreak = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VocabProgress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VocabProgress_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VocabProgress_UserId_VocabId",
                table: "VocabProgress",
                columns: new[] { "UserId", "VocabId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "VocabProgress");

            migrationBuilder.DropTable(
                name: "Vocabs");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
