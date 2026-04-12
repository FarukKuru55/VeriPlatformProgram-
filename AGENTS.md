# VeriPlatform Agent Instructions

## Project Structure

```
D:\Projeler\
├── VeriPlatform/          # Backend (.NET 8 + EF Core + PostgreSQL)
│   └── VeriPlatform/
│       ├── Controllers/   # API endpoints
│       ├── Entities/      # DB models (User, Role, FormTemplate, etc.)
│       ├── Data/           # AppDbContext
│       └── Program.cs      # Entry point
└── veri-platform-ui/      # Frontend (React + Vite)
    └── src/
        ├── pages/          # Login.jsx, UserPanel, Admin
        └── index.css       # CSS variables
```

## Key Commands

### Backend
- **Run**: `dotnet run` in `VeriPlatform/VeriPlatform/` (port 5062)
- **Migrations**: `dotnet ef migrations add <name>` / `dotnet ef database update`

### Frontend
- **Run dev**: `npm run dev` in `veri-platform-ui/`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## Architecture Notes

### Backend
- JWT Auth: tokens generated in `AuthController.cs:74-80`, validated in `Program.cs:47-60`
- Password hashing: `BCrypt.Net.BCrypt.HashPassword()` / `BCrypt.Net.BCrypt.Verify()`
- Seed user: username `faruk`, password `1234` (Admin + User roles)

### Frontend
- API base URL: `http://localhost:5062`
- Token stored in `localStorage` as `token`
- Role check: `decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']`
- Toast notifications via `react-hot-toast`
- Login page: `src/pages/Login.jsx` with `Login.css`

## CSS Conventions

CSS variables defined in `src/index.css`:
- `--primary: #6366f1` (indigo)
- `--surface: #ffffff`, `--bg: #f1f5f9`
- `--text-1: #0f172a` to `--text-4: #94a3b8`
- `--radius: 10px`, `--radius-sm: 6px`
- `--transition: 0.2s ease`
- Font: `var(--font-display)` for headings

## Important Conventions

- **Register endpoint**: Currently `[Authorize(Roles = "Admin")]` - only admins can create users
- **Public registration**: If adding public register, use `[AllowAnonymous]` and create user with "User" role (Id: 2)
- **DB password hashing**: Always use BCrypt - never store plain text passwords
