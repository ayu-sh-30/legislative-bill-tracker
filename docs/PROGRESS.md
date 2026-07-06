<!-- docs/PROGRESS.md -->

# Progress Log

## Day 1 - Foundation

### Checkpoint 1: Project structure and GitHub setup

Status: Complete

Built:
- Initial monorepo folder structure
- Placeholder files for API, web, shared types, docs, and CI
- README skeleton
- Git ignore rules

Notes:
- Database decision: PostgreSQL + Prisma
- Reason: relational domain with bills, versions, stages, users, follows, MPs, and activity records

### Checkpoint 2: GitHub planning setup

Status: Complete

Built:
- GitHub repository created and pushed
- Five day-based milestones created
- Day 1 issues created for schema, API setup, Prisma migration, and initial fetcher
- GitHub Project board created for the 5-day build

Why it matters:
- Milestones split the project into clear delivery phases.
- Issues turn each day into small, trackable checkpoints.
- The project board gives a visible workflow for moving tasks from planned to done.

Interview notes:
- I used GitHub milestones and issues to manage the project like a real product build.
- Each feature will be developed on a short-lived branch and merged through a PR.

### Checkpoint 3: API foundation and Prisma schema

Status: Complete

Built:
- Express + TypeScript backend foundation
- Environment validation with dotenv and Zod
- Health check route
- Centralized error middleware
- Shared Prisma client setup
- Initial PostgreSQL schema using Prisma
- Initial migration for bills, bill versions, stages, MPs, MP activity, users, and follows

Interview notes:
- Prisma models represent the relational structure of the app.
- Bill versions and stages are separate tables because a bill can have many text versions and many timeline events.
- Follow is a join table because users and bills have a many-to-many relationship.
- Raw scraped source data is preserved using JSON fields for auditability.

### Checkpoint 4: Initial bill ingestion job

Status: Complete

Built:
- Bill ingestion service that saves normalized bill data through Prisma
- Idempotent upsert logic for bills, stages, and versions
- Seed job with initial manually curated bill records
- Database uniqueness rule for bill source identity
- Local verification that the seed job runs successfully

Why it matters:
- The ingestion pipeline is separated from the data source.
- Future Sansad and PRS fetchers can produce the same normalized input shape.
- Running the job repeatedly should not create duplicate bill records.

Interview notes:
- I separated source parsing from database ingestion so scraper changes do not affect storage logic.
- I used Prisma upsert with compound unique constraints to make the seed job idempotent.
- I preserved raw source metadata in JSON fields for traceability.

## Day 2 - Backend API

### Checkpoint 1: Public bill API endpoints

Status: Complete

Built:
- Bill service functions for list, detail, and timeline queries
- Bill controller functions for request parsing and JSON responses
- Bill routes for `/api/bills`, `/api/bills/:id`, and `/api/bills/:id/timeline`
- Query filters for status, house, year, and title search
- Not-found handling for missing bill IDs

Verified:
- `GET /api/bills`
- `GET /api/bills/:id`
- `GET /api/bills/:id/timeline`
- `GET /api/bills?year=2023`
- `GET /api/bills?status=Passed`
- `GET /api/bills?search=Sanhita`

Interview notes:
- I used a route-controller-service structure to separate URL mapping, HTTP handling, and database logic.
- The list endpoint returns selected fields to keep responses lightweight.
- The detail endpoint includes related versions and stages because the bill detail page needs full context.
- The timeline endpoint returns only stage events ordered by date for timeline UI rendering.

### Checkpoint 2: MP profile API endpoints

Status: Complete

Built:
- MP service functions for list, detail, and activity queries
- MP controller functions for request parsing and JSON responses
- MP routes for `/api/mps`, `/api/mps/:id`, and `/api/mps/:id/activities`
- Query filters for party, state, house, and name search
- Manual MP seed job for local development data
- Unique MP source identity for idempotent MP seeding

Verified:
- `GET /api/mps`
- `GET /api/mps/:id`
- `GET /api/mps/:id/activities`
- `GET /api/mps?search=Rahul`
- `GET /api/mps?party=Bharatiya%20Janata%20Party`
- `GET /api/mps?state=Gujarat`
- `GET /api/mps?house=Lok%20Sabha`

Interview notes:
- I reused the route-controller-service pattern from the bill APIs.
- The MP list endpoint supports filters for browsing by party, state, house, and name.
- The MP detail endpoint includes activity records because profile pages need both identity and legislative activity.
- The seed job uses a compound source identity so MP records can be inserted or updated without duplication.

### Checkpoint 3: JWT authentication

Status: Complete

Built:
- Signup endpoint with Zod validation
- Login endpoint with password verification
- Password hashing with bcrypt
- JWT issuing with user ID stored in `sub`
- Auth middleware for protected routes
- Protected `/api/auth/me` endpoint
- Architecture documentation for authentication and authorization flow

Verified:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` with Bearer token
- `GET /api/auth/me` without token returns `401`

Interview notes:
- I used bcrypt so plain passwords are never stored.
- I used JWTs so clients can authenticate once and send a signed token on later requests.
- The auth middleware verifies the token and attaches the authenticated user to `req.user`.
- `/api/auth/me` checks the database so stale tokens do not return deleted user data.

### Checkpoint 4: Protected follow routes

Status: Complete

Built:
- Protected follow route for bills
- Protected unfollow route for bills
- Protected current-user follows route
- Follow service using Prisma upsert for idempotent follow behavior
- Auth middleware integration with user-specific actions
- Safe unfollow behavior using `deleteMany`

Verified:
- `POST /api/bills/:id/follow` with Bearer token
- `DELETE /api/bills/:id/follow` with Bearer token
- `GET /api/me/follows` with Bearer token
- Protected follow routes reject unauthenticated requests with `401`
- Re-following the same bill does not create duplicates

Interview notes:
- I used the `Follow` join table to model a many-to-many relationship between users and bills.
- Follow actions are protected by JWT auth middleware.
- The authenticated user ID comes from the verified token, not from client-provided body data.
- `upsert` makes following idempotent, and `deleteMany` makes unfollowing safe to retry.

## Day 3 - Frontend Browsing and Timeline

### Checkpoint 1: Next.js frontend foundation

Status: Complete

Built:
- Initialized the Next.js frontend app inside `apps/web`
- Added frontend package scripts for dev, build, start, and lint
- Added TypeScript and Next.js configuration files
- Added environment configuration for backend API base URL
- Added root layout and global CSS
- Added a shared frontend API client for bill requests
- Added TypeScript types for bill list items, bill details, bill stages, and bill versions
- Added CSS module declaration support for global stylesheet imports

Verified:
- `npm.cmd install` completed in `apps/web`
- `npm.cmd run build` passes
- Frontend app can run locally on `http://localhost:3000`
- API client points to backend via `NEXT_PUBLIC_API_BASE_URL`

Interview notes:
- I set up the frontend as a separate Next.js app inside the monorepo.
- The frontend talks to the Express API, not directly to the database.
- I centralized backend calls in `lib/api-client.ts` so pages and components do not hardcode fetch logic.
- I used TypeScript types matching backend responses to make frontend data rendering safer.

### Checkpoint 2: Bill list page

Status: Complete

Built:
- Next.js homepage showing tracked bills from the backend API
- Shared API client for bill list and detail requests
- Reusable bill card component
- Basic page styling and empty state
- External source link for each bill

Verified:
- Frontend runs at `http://localhost:3000`
- Backend API runs at `http://localhost:4000`
- Homepage renders seeded bill records
- Bill cards show title, status, house, date, ministry, and bill number

Interview notes:
- I used a typed API client so frontend pages do not hardcode fetch logic.
- The homepage fetches data from the Express API instead of accessing the database directly.
- I separated the bill card into a reusable component to keep the page clean.

### Checkpoint 3: Bill detail page with timeline

Status: Complete

Built:
- Dynamic bill detail route at `/bills/:id`
- Bill detail page fetching data from the backend API
- Reusable visual timeline component
- Bill metadata panel for introduced date, year, and source
- Versions panel for bill text versions
- Back navigation to the bill list
- Responsive layout for mobile and desktop

Verified:
- Homepage bill links open the correct detail page
- Bill detail page shows title, status, ministry, bill number, and source link
- Timeline renders bill stages in chronological order
- Versions section renders available bill versions
- `npm.cmd run build` passes for the frontend

Interview notes:
- I used a dynamic Next.js route with `app/bills/[id]/page.tsx`.
- The detail page fetches one bill by ID using the shared API client.
- The timeline is separated into a reusable component so it can be reused or tested independently.
- The frontend still talks only to the Express API and does not access the database directly.

### Checkpoint 4: Login and follow UI

Status: Complete

Built:
- Client-side login panel using the backend JWT login endpoint
- Token storage in `localStorage`
- Auth state restoration using `/api/auth/me`
- Follow/unfollow panel on the bill detail page
- Protected follow API calls using the Bearer token
- Follow state refresh from `/api/me/follows`
- React callback stability fix using `useCallback` to prevent repeated follow-state checks

Verified:
- User can log in from the bill detail page
- JWT token is stored locally after login
- Refreshing the page restores the logged-in user
- User can follow a bill
- User can unfollow a bill
- Follow state remains stable after refresh
- `npm.cmd run build` passes

Interview notes:
- I used Client Components for login and follow interactions because they require browser state and event handlers.
- The frontend stores the JWT and sends it in the `Authorization: Bearer` header for protected routes.
- The follow state is loaded from the backend rather than guessed locally.
- I fixed a React re-render loop by memoizing the auth-change callback with `useCallback`.

## Day 4 - Version Diffing and AI Summaries

### Checkpoint 1: PRS bill ingestion

Status: Complete

Built:
- PRS bill source service for fetching the Bill Track page
- HTML parsing with Cheerio
- PRS bill fetch job
- Normalization from PRS list items into the existing bill ingestion format
- Real PRS bills saved into PostgreSQL through Prisma

Verified:
- PRS fetch job runs locally
- Real PRS bill records are inserted or updated in the database
- Frontend bill list shows more than the manually seeded bills
- Existing ingestion service works for both manual seed data and PRS data

Interview notes:
- I separated source parsing from database ingestion.
- PRS data is normalized into the same `NormalizedBillInput` shape used by seed data.
- The ingestion service remains source-agnostic.
- Raw PRS source metadata is preserved in `rawSourceData`.

### Checkpoint 2: PRS detail enrichment

Status: Complete

Built:
- PRS bill detail fetcher
- Ministry extraction from detail pages
- Timeline stage extraction from PRS detail text
- PDF/document link extraction from PRS relevant links
- Summary text extraction where available
- JSON-safe raw detail storage
- Listing parser filters to skip category/navigation links
- Fetch timeout protection for PRS requests

Verified:
- PRS fetch job runs locally after enrichment
- PRS navigation/category links are skipped
- Real bill detail pages are fetched
- Enriched bills are ingested through the existing bill ingestion service
- Bill detail pages show richer metadata, stages, and versions where available

Interview notes:
- I treated PRS as a source adapter rather than coupling scraper logic to database writes.
- I preserved raw detail data in JSON after converting dates to strings.
- I added defensive parsing because PRS pages include navigation and category links alongside bill links.
- I kept the ingestion service unchanged, proving the normalized ingestion boundary works.

### Checkpoint 3: PDF text extraction foundation

Status: Complete

Built:
- PDF text extraction service for bill version PDFs
- PDF extraction job for bill versions missing `textContent`
- Fetch timeout and user-agent handling for PDF downloads
- Whitespace normalization for extracted text
- Storage of extracted text in `bill_versions.textContent`

Verified:
- `npm.cmd run build`
- PDF extraction job runs locally
- Bill versions with PDF URLs receive extracted text content
- Extraction skips versions that already have text content

Interview notes:
- I separated PDF extraction into a service so it can be reused by jobs or future endpoints.
- The extraction job only processes versions where `textContent` is empty, making it safe to rerun.
- Extracted text is stored on `bill_versions` because diffing compares versions, not the bill metadata row.
- I used the class-based `PDFParse` API and cleaned up parser resources after extraction.

### Checkpoint 4: Deterministic diff foundation

Status: Complete

Built:
- Bill diff service for comparing two extracted bill versions
- Clause-like text normalization and splitting
- Word-level diffing for modified clauses
- Diff controller and route
- Diff endpoint at `/api/bills/:id/diff?from=VERSION_ID&to=VERSION_ID`
- Validation that both versions belong to the requested bill
- Validation that both versions have extracted text before diffing

Verified:
- `npm.cmd run build`
- Diff endpoint returns structured output for two extracted bill versions
- Diff response includes added, removed, modified, and unchanged counts
- Diff response includes clause-level before/after text and word-level changes

Interview notes:
- I kept diffing deterministic rather than relying on an LLM for comparison.
- Legal text is split into clause-like units because naive line diffing is noisy for PDF-extracted legal documents.
- Word-level diffing is used only inside modified clause units.
- This structured diff can be passed to an LLM later for summarization with citations.