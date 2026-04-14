using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VeriPlatform.Migrations
{
    /// <inheritdoc />
    public partial class PeriyodikSistemGecis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "FormTemplates");

            migrationBuilder.DropColumn(
                name: "IsRecurring",
                table: "FormTemplates");

            migrationBuilder.DropColumn(
                name: "RecurrenceType",
                table: "FormTemplates");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "FormTemplates");

            migrationBuilder.AddColumn<int>(
                name: "PeriodType",
                table: "FormTemplates",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$Stm/SusM048kZmFNXH9k0.hblRvNDiF.1aZd8SUC28JDXykOltoFm");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PeriodType",
                table: "FormTemplates");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "FormTemplates",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRecurring",
                table: "FormTemplates",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceType",
                table: "FormTemplates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "FormTemplates",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$zn8H2x.kpWgZzptkgF9MGeikjb.LNi5sPbKdhFfqMwklqw0Yqo/5u");
        }
    }
}
