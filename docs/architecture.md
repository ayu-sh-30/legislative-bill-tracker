<!-- docs/architecture.md -->

# Architecture

## Database Choice

This project uses PostgreSQL with Prisma.

PostgreSQL was chosen because the core domain is relational: bills have versions, bills move through stages, users follow bills, and MP activity may reference legislative records. Prisma is used as the TypeScript ORM so database models, migrations, and queries stay type-safe and easier to maintain.

Raw scraped source data is still preserved using JSON fields where needed, so the app can keep official source payloads without forcing every scraped field into a rigid schema immediately.

## Core Database Design

```mermaid
erDiagram
    BILL ||--o{ BILL_VERSION : has
    BILL ||--o{ BILL_STAGE : moves_through
    USER ||--o{ FOLLOW : creates
    BILL ||--o{ FOLLOW : is_followed_by
    MP ||--o{ MP_ACTIVITY : has
    BILL ||--o{ MP_ACTIVITY : may_reference

    BILL {
        uuid id PK
        string title
        string shortTitle
        string billNumber
        int year
        string house
        string ministry
        string status
        date introducedDate
        string source
        string sourceUrl
        json rawSourceData
        datetime createdAt
        datetime updatedAt
    }

    BILL_VERSION {
        uuid id PK
        uuid billId FK
        string versionLabel
        date versionDate
        string pdfUrl
        string textContent
        string source
        json rawSourceData
        datetime createdAt
        datetime updatedAt
    }

    BILL_STAGE {
        uuid id PK
        uuid billId FK
        string stage
        string house
        date stageDate
        string description
        string sourceUrl
        datetime createdAt
        datetime updatedAt
    }

    USER {
        uuid id PK
        string name
        string email
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }

    FOLLOW {
        uuid id PK
        uuid userId FK
        uuid billId FK
        datetime createdAt
    }

    MP {
        uuid id PK
        string name
        string house
        string party
        string state
        string constituency
        string source
        json rawSourceData
        datetime createdAt
        datetime updatedAt
    }

    MP_ACTIVITY {
        uuid id PK
        uuid mpId FK
        uuid billId FK
        string activityType
        string title
        date activityDate
        string sourceUrl
        json rawSourceData
        datetime createdAt
        datetime updatedAt
    }