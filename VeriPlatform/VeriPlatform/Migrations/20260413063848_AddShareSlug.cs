using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VeriPlatform.Migrations
{
    /// <inheritdoc />
    public partial class AddShareSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShareSlug",
                table: "FormTemplates",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { null, "$2a$11$zn8H2x.kpWgZzptkgF9MGeikjb.LNi5sPbKdhFfqMwklqw0Yqo/5u" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ShareSlug",
                table: "FormTemplates");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$YpxUW2Zp9kBM1DTg34NPsu41pZbYShmOp8MjDQyvfjjCSRilIiIIW");
        }
    }
}
