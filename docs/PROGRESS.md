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