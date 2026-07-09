### Notification Database Design

Day 5 adds an in-app notification model.

~~~mermaid
erDiagram
    USER ||--o{ NOTIFICATION : receives
    BILL ||--o{ NOTIFICATION : triggers
    BILL_STAGE ||--o{ NOTIFICATION : creates

    NOTIFICATION {
        uuid id PK
        uuid userId FK
        uuid billId FK
        uuid billStageId FK
        string type
        string title
        string message
        datetime readAt
        datetime createdAt
        datetime updatedAt
    }
~~~

The notification table stores user-specific alerts for followed bill updates.

Key fields:
- `userId`: the user receiving the notification
- `billId`: the bill related to the notification
- `billStageId`: the stage event that triggered the notification
- `type`: currently `stage_change`
- `title`: short display title
- `message`: readable notification message
- `readAt`: null when unread, timestamp when read

A uniqueness rule prevents duplicate notifications for the same user and bill stage:

~~~prisma
@@unique([userId, billStageId, type])
~~~

### Notification Creation Flow

Notifications are created when a new stage is added for a bill that users follow.

~~~mermaid
flowchart TD
    A["Bill ingestion or test simulation job"] --> B["Create new BillStage"]
    B --> C["createStageNotificationsForFollowers()"]
    C --> D["Find users following this bill"]
    D --> E["Create Notification rows"]
    E --> F["User opens /me/notifications"]
    F --> G["GET /api/me/notifications"]
    G --> H["Render unread/read alerts"]
~~~

This design connects notifications to backend data changes rather than frontend-only state.

### Notification API Flow

Notification routes are protected by JWT authentication.

~~~mermaid
flowchart TD
    A["Frontend with stored JWT"] --> B["GET /api/me/notifications"]
    B --> C["requireAuth middleware"]
    C --> D["Attach req.user"]
    D --> E["notification controller"]
    E --> F["notification service"]
    F --> G["Prisma notification.findMany"]
    G --> H["Return notifications for current user"]

    I["User clicks Mark as read"] --> J["PATCH /api/me/notifications/:id/read"]
    J --> C
    C --> K["Verify notification belongs to req.user"]
    K --> L["Set readAt timestamp"]
~~~

The backend never trusts a user ID from the request body. It uses the authenticated user ID from the verified JWT.



### Stage Change Simulation Job

A local simulation job is included for testing notifications without waiting for a real source update.

~~~text
apps/api/src/jobs/simulate-stage-change.ts
~~~

The job:
- finds a bill followed by a user
- creates a new `BillStage`
- calls `createStageNotificationsForFollowers`
- creates notification rows for users following that bill

This makes notification testing repeatable during local development.