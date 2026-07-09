<!-- README.md -->

# Indian Legislative Bill Tracker

A full-stack application for tracking Indian legislative bills, viewing bill timelines, comparing bill text versions, following bills, receiving stage-change notifications, and generating plain-English AI summaries from deterministic clause-level diffs.

## Problem

Indian legislative information is spread across official portals, PRS summaries, PDFs, and activity datasets. This project brings bill records, status timelines, text versions, follow tracking, notifications, and amendment explanations into one interface.

## Features

- Browse tracked legislative bills
- View bill detail pages with metadata, versions, and status timelines
- Ingest real bill data from PRS
- Extract text from bill PDFs
- Compare bill versions with deterministic clause/word-level diffing
- Generate AI-assisted summaries from deterministic diff output
- Sign up and log in with JWT authentication
- Follow and unfollow bills
- View followed bills
- Receive in-app notifications when followed bills get new stage updates
- Switch between light and dark themes
- Use demo data for reliable local AI-summary testing

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Lucide React icons
- CSS variables for light/dark theme styling

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Zod validation

### Data And AI

- PRS bill ingestion with Cheerio
- PDF text extraction with `pdf-parse`
- Deterministic diffing with `diff`
- Gemini/OpenAI-compatible AI summarization

## Monorepo Structure

~~~text
legislative-bill-tracker/
├── apps/
│   ├── api/                    # Express + TypeScript backend
│   └── web/                    # Next.js frontend
├── packages/
│   └── shared-types/           # Shared TypeScript types
├── docs/
│   ├── architecture.md         # Architecture index
│   ├── architecture/           # Split architecture docs
│   ├── PROGRESS.md             # Build progress log
│   └── screenshots/            # App screenshots
├── .github/
│   └── workflows/              # CI workflows
├── .gitignore
├── LICENSE
└── README.md
~~~

## Architecture

Architecture notes are split by topic:

- [Architecture Index](docs/architecture.md)
- [Database Design](docs/architecture/01-database-design.md)
- [Backend API Architecture](docs/architecture/02-backend-api.md)
- [Authentication And Follows](docs/architecture/03-auth-and-follows.md)
- [Frontend Architecture](docs/architecture/04-frontend.md)
- [Ingestion And PDF Extraction](docs/architecture/05-ingestion-and-pdf.md)
- [Diffing And AI Summarization](docs/architecture/06-diff-and-ai.md)
- [Notifications](docs/architecture/07-notifications.md)
- [Final Demo Flow](docs/architecture/08-demo-flow.md)

## Key Design Decisions

### PostgreSQL + Prisma

PostgreSQL was chosen because the project domain is relational. Bills have versions, stages, follows, notifications, and MP activity references. Prisma provides type-safe queries, migrations, and a clear schema for those relationships.

### Deterministic Diff Before AI

The app does not ask an LLM to decide what changed. The backend first creates a deterministic clause/word-level diff. The AI model only summarizes that structured diff in plain English.

### Demo Data

Real PRS ingestion is the main data path. A clearly labelled demo bill is included only to make local AI-summary testing reliable when real scraped data does not contain two clean text-extracted versions.

## Local Setup

### Prerequisites

Install:

- Node.js
- npm
- PostgreSQL database or Neon PostgreSQL
- Git

This project uses PowerShell commands on Windows.

## Backend Setup

Go to the API app:

~~~powershell
cd "C:\Users\AYUSH YADAV\Documents\legislative-bill-tracker\apps\api"
~~~

Install dependencies:

~~~powershell
npm.cmd install
~~~

Create `.env` from `.env.example`:

~~~powershell
Copy-Item ".env.example" ".env"
~~~

Update `apps/api/.env`:

~~~env
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="replace-this-with-a-long-random-secret-at-least-32-characters"

AI_PROVIDER="gemini"

OPENAI_API_KEY=
OPENAI_MODEL="gpt-5.5"

GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3.1-flash-lite"
~~~

Run Prisma commands:

~~~powershell
.\node_modules\.bin\prisma.cmd format --schema=prisma/schema.prisma
.\node_modules\.bin\prisma.cmd migrate dev --name init --schema=prisma/schema.prisma
.\node_modules\.bin\prisma.cmd generate --schema=prisma/schema.prisma
~~~

Build backend:

~~~powershell
npm.cmd run build
~~~

Seed initial data:

~~~powershell
npm.cmd run db:seed:bills
npm.cmd run db:seed:mps
npm.cmd run db:seed:demo-diff
~~~

Optional real-data jobs:

~~~powershell
npm.cmd run db:fetch:prs-bills
npm.cmd run db:extract:pdf-text
~~~

Start backend:

~~~powershell
npm.cmd run dev
~~~

Backend runs on:

~~~text
http://localhost:4000
~~~

## Frontend Setup

Open a second PowerShell terminal.

Go to the web app:

~~~powershell
cd "C:\Users\AYUSH YADAV\Documents\legislative-bill-tracker\apps\web"
~~~

Install dependencies:

~~~powershell
npm.cmd install
~~~

Create `.env.local`:

~~~powershell
Copy-Item ".env.example" ".env.local"
~~~

Confirm `apps/web/.env.local` contains:

~~~env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
~~~

Build frontend:

~~~powershell
npm.cmd run build
~~~

Start frontend:

~~~powershell
npm.cmd run dev
~~~

Frontend runs on:

~~~text
http://localhost:3000
~~~

## Useful Backend Scripts

Run these from `apps/api`.

### Start API

~~~powershell
npm.cmd run dev
~~~

### Build API

~~~powershell
npm.cmd run build
~~~

### Seed manual bill data

~~~powershell
npm.cmd run db:seed:bills
~~~

### Seed MP data

~~~powershell
npm.cmd run db:seed:mps
~~~

### Fetch PRS bills

~~~powershell
npm.cmd run db:fetch:prs-bills
~~~

### Extract PDF text

~~~powershell
npm.cmd run db:extract:pdf-text
~~~

### Seed demo diff bill

~~~powershell
npm.cmd run db:seed:demo-diff
~~~

### Simulate a stage-change notification

~~~powershell
npm.cmd run db:simulate:stage-change
~~~

## Demo Flow

1. Start backend on `http://localhost:4000`.
2. Start frontend on `http://localhost:3000`.
3. Open the homepage.
4. Log in using the demo account if seeded.
5. Open an AI-ready bill.
6. Generate an AI-assisted diff summary.
7. Follow a bill.
8. Open `/me/follows` to view followed bills.
9. Run the notification simulation job from `apps/api`.
10. Open `/me/notifications` to view the generated notification.
11. Mark the notification as read.

## Screenshots

Screenshots should be saved in:

~~~text
docs/screenshots/
~~~

Recommended screenshot files:

~~~text
docs/screenshots/home.png
docs/screenshots/bill-detail-ai-summary.png
docs/screenshots/follows.png
docs/screenshots/notifications.png
~~~

| Screen | Path |
| --- | --- |
| Homepage | `docs/screenshots/home.png` |
| Bill detail with AI summary | `docs/screenshots/bill-detail-ai-summary.png` |
| Followed bills | `docs/screenshots/follows.png` |
| Notifications | `docs/screenshots/notifications.png` |

## API Overview

### Public Bill Routes

~~~text
GET /api/bills
GET /api/bills/:id
GET /api/bills/:id/timeline
GET /api/bills/:id/diff?from=VERSION_ID&to=VERSION_ID
POST /api/bills/:id/diff-summary
GET /api/ai-ready-bills
~~~

### Auth Routes

~~~text
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
~~~

### Protected User Routes

~~~text
POST /api/bills/:id/follow
DELETE /api/bills/:id/follow
GET /api/me/follows
GET /api/me/notifications
PATCH /api/me/notifications/:id/read
~~~

### MP Routes

~~~text
GET /api/mps
GET /api/mps/:id
GET /api/mps/:id/activities
~~~

## Environment Variables

### API

~~~env
PORT=4000
DATABASE_URL=
JWT_SECRET=
AI_PROVIDER=
OPENAI_API_KEY=
OPENAI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
~~~

### Web

~~~env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
~~~

## Current Status

Completed:

- Backend API foundation
- PostgreSQL schema with Prisma
- Bill, version, stage, MP, user, follow, and notification models
- PRS ingestion
- PDF text extraction
- Deterministic diffing
- AI-assisted summarization
- Login and JWT auth
- Follow/unfollow bills
- Followed bills page
- Notification inbox
- Light/dark theme
- Demo data for reliable local testing

Pending future improvements:

- Production deployment
- Email notifications
- More robust Sansad ingestion
- Search and filters
- Automated tests
- CI refinement

## License

See [LICENSE](LICENSE).