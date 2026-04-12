using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VeriPlatform.Migrations
{
    /// <inheritdoc />
    public partial class AddRequiredAndImageToQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Questions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRequired",
                table: "Questions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$O9tgqj4XeQfJhvT0kipDx.WAifz3PGQdKcdLOhj3rHqcZcsXS7C8W");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "IsRequired",
                table: "Questions");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$aD0YdMJHowDn1BXrF1Lboe4WGJGz6p/z4FGnmNOcW8MwQ/E2jiJhO");
        }
    }
}
