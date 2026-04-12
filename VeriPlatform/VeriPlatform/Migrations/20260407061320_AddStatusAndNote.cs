using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VeriPlatform.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusAndNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "Submissions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Submissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$pvN4ouCY0/M7M3XFMJG6GuulT56tYUfYVdYb7MRitUxR5gHwKWo.S");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Submissions");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$y9AVoLQvsfjaLqZbnyQxT.hLtgt.0wIgWE6dTPzofjgCtI9m0mIbS");
        }
    }
}
