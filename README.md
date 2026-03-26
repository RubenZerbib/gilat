# Clinic Medical Form Signing System

Digital signing system for a cosmetic clinic. Clients fill out a multi-step form on a tablet (iPad), sign with their finger, and the system generates a signed PDF from the original template.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Client (iPad/Tablet)                       │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Step 1  │→ │  Step 2  │→ │  Step 3   │  │
│  │Personal │  │ Medical  │  │ Signature │  │
│  └─────────┘  └──────────┘  └───────────┘  │
└──────────────────┬──────────────────────────┘
                   │ POST /api/forms
┌──────────────────▼──────────────────────────┐
│  Next.js API Route                          │
│  1. Validate (Zod)                          │
│  2. Generate PDF (pdf-lib)                  │
│  3. Save to filesystem                      │
│  4. Store record in DB (Prisma/SQLite)      │
└─────────────────────────────────────────────┘
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + SQLite
- **pdf-lib** for PDF generation
- **react-signature-canvas** for signature capture
- **Zod** + React Hook Form for validation

## Setup

### One-Click Launch (Windows `.exe`)

> **Prerequisite:** [Node.js 18+](https://nodejs.org) must be installed.

#### Step 1 — Build the launcher (once)

Double-click **`build_exe.bat`**.  
This compiles `ClinicForm.exe` using the C# compiler that ships with Windows — no installs needed.

#### Step 2 — Run the app

Double-click **`ClinicForm.exe`**.  
It will:

1. Install npm dependencies (first run only)
2. Create the `.env` config file
3. Prepare the SQLite database
4. Start the local server
5. Open `http://localhost:3000` in your browser automatically

Close the console window to stop the server.

#### Alternative — batch script (no build step)

If you prefer not to build the `.exe`, double-click **`start_app.bat`** instead.  
It does exactly the same thing.

### Manual Setup (any OS)

```bash
npm install
cp .env.example .env      # Linux/macOS  (or: copy .env.example .env  on Windows)
npx prisma db push
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `ADMIN_USERNAME` | Admin panel username | `admin` |
| `ADMIN_PASSWORD` | Admin panel password | `clinic2024!` |

## PDF Template

Place your 3-page clinic PDF template at:

```
public/template.pdf
```

If no template exists, the system creates a blank 3-page PDF.

Adjust field coordinates in `src/config/pdf-mapping.ts`.

## Routes

| Path | Description |
|------|-------------|
| `/` | Client form (multi-step) |
| `/success` | Submission confirmation |
| `/admin` | Admin login |
| `/admin/forms` | Admin dashboard (search, view, download) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/forms` | Submit signed form |
| `GET` | `/api/forms` | List forms (with search) |
| `GET` | `/api/forms/:id` | Get form details |
| `GET` | `/api/forms/:id?download=true` | Download PDF |
| `POST` | `/api/admin/auth` | Admin login |
| `DELETE` | `/api/admin/auth` | Admin logout |

## File Storage

Signed PDFs are stored at:

```
storage/signed-forms/YYYY/MM/<idNumber>_<fullName>_<date>.pdf
```

## Hebrew Font Support

The current implementation uses Helvetica for PDF text overlay. To add Hebrew font support:

1. Place a Hebrew-compatible `.ttf` font in `public/fonts/`
2. Update `src/lib/pdf-generator.ts` to embed the custom font via `pdfDoc.embedFont()`

## Database Schema

```prisma
model SignedForm {
  id        String   @id @default(cuid())
  fullName  String
  idNumber  String
  answers   String   // JSON
  pdfPath   String
  createdAt DateTime @default(now())
}
```
