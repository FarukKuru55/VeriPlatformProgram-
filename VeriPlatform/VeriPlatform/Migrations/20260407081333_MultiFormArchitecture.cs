using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VeriPlatform.Migrations
{
    /// <inheritdoc />
    public partial class MultiFormArchitecture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FormTemplateId",
                table: "Submissions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FormTemplateId",
                table: "Questions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "FormTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormTemplates", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$kk/P.MC8Kq6GF9iwVXTqZOf.mbn0JtPfQG16/aVlP7P9Jz796MahW");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_FormTemplateId",
                table: "Submissions",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_FormTemplateId",
                table: "Questions",
                column: "FormTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_FormTemplates_FormTemplateId",
                table: "Questions",
                column: "FormTemplateId",
                principalTable: "FormTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_FormTemplates_FormTemplateId",
                table: "Submissions",
                column: "FormTemplateId",
                principalTable: "FormTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_FormTemplates_FormTemplateId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_FormTemplates_FormTemplateId",
                table: "Submissions");

            migrationBuilder.DropTable(
                name: "FormTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_FormTemplateId",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_FormTemplateId",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "FormTemplateId",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "FormTemplateId",
                table: "Questions");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$pvN4ouCY0/M7M3XFMJG6GuulT56tYUfYVdYb7MRitUxR5gHwKWo.S");
        }
    }
}
