<!-- docs/architecture.md -->

# Architecture

This document is the architecture index for the Indian Legislative Bill Tracker.

The detailed architecture has been split by topic so each file stays readable and focused.

## Sections

1. [Database Design](architecture/01-database-design.md)
2. [Backend API Architecture](architecture/02-backend-api.md)
3. [Authentication And Follows](architecture/03-auth-and-follows.md)
4. [Frontend Architecture](architecture/04-frontend.md)
5. [Ingestion And PDF Extraction](architecture/05-ingestion-and-pdf.md)
6. [Diffing And AI Summarization](architecture/06-diff-and-ai.md)
7. [Notifications](architecture/07-notifications.md)
8. [Final Demo Flow](architecture/08-demo-flow.md)

## High-Level System Flow

~~~mermaid
flowchart TD
    A["Next.js frontend"] --> B["Express API"]
    B --> C["Prisma ORM"]
    C --> D["PostgreSQL database"]

    E["PRS / Sansad sources"] --> F["Ingestion jobs"]
    F --> B

    G["Bill PDFs"] --> H["PDF text extraction"]
    H --> C

    I["Deterministic diff service"] --> J["AI summarization service"]
    J --> B

    K["User follows bill"] --> L["Stage-change notification"]
    L --> A
~~~

## Core Design Decisions

- PostgreSQL is used because bills, versions, stages, users, follows, MPs, and notifications are relational.
- Prisma is used for type-safe database access and migrations.
- Scraped source data is normalized before storage.
- Raw source metadata is preserved in JSON fields for traceability.
- Diffing is deterministic code; AI only summarizes the deterministic diff output.
- JWT authentication protects user-specific actions such as follows and notifications.
- In-app notifications are created from backend stage changes, not frontend-only state.