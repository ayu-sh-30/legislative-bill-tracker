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