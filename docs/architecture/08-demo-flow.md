### Final Demo Flow

A complete local demo can show:

1. Browse bills on the homepage.
2. Open an AI-ready bill.
3. Generate an AI-assisted version summary.
4. Log in.
5. Follow a bill.
6. View followed bills at `/me/follows`.
7. Run the stage-change simulation job.
8. View the generated alert at `/me/notifications`.
9. Mark the notification as read.

This demonstrates the full product loop:
- data ingestion
- relational persistence
- authenticated user actions
- deterministic diffing
- AI summarization
- user-specific notifications