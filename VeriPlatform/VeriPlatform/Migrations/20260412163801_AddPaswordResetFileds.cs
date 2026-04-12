using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VeriPlatform.Migrations
{
    /// <inheritdoc />
    public partial class AddPaswordResetFileds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResetCode",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResetCodeExpires",
                table: "Users",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PasswordHash", "ResetCode", "ResetCodeExpires" },
                values: new object[] { "$2a$11$YpxUW2Zp9kBM1DTg34NPsu41pZbYShmOp8MjDQyvfjjCSRilIiIIW", null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResetCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ResetCodeExpires",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$O9tgqj4XeQfJhvT0kipDx.WAifz3PGQdKcdLOhj3rHqcZcsXS7C8W");
        }
    }
}
