using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VeriPlatform.Migrations
{
    public partial class AddFormAssignmentTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. GÖREV ATAMA TABLOSUNU OLUŞTURUYORUZ
            migrationBuilder.CreateTable(
                name: "FormAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    FormTemplateId = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CompletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormAssignments_FormTemplates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "FormTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormAssignments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // 2. INDEX EKLEME (Performans ve Güvenlik İçin)
            // Bir kullanıcıya aynı form 2 kez atanmasın (Unique Constraint)
            migrationBuilder.CreateIndex(
                name: "IX_FormAssignments_UserId_FormTemplateId",
                table: "FormAssignments",
                columns: new[] { "UserId", "FormTemplateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormAssignments_FormTemplateId",
                table: "FormAssignments",
                column: "FormTemplateId");

            // 3. SEED DATA GÜNCELLEME (Opsiyonel - Şifre Hashleme)
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$aD0YdMJHowDn1BXrF1Lboe4WGJGz6p/z4FGnmNOcW8MwQ/E2jiJhO");

            // NOT: EndDate ve StartDate satırlarını bilerek eklemiyoruz. 
            // DB tarafında manuel çözüm yaptığımız için EF Core hata vermesin.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormAssignments");
        }
    }
}