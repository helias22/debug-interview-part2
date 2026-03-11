# Recent Git History

```
commit e4b21cc — 2026-03-10 — Alex Turner
    Onboard Meridian Insurance (org_id: 47)

    - Created org, invited 3 users
    - Enabled SMS notifications for the org

    Files changed:
      apps/server/routes/onboarding.ts

commit d9a3f71 — 2026-03-05 — Alex Turner
    Fix: handle empty task description in email templates

    Files changed:
      apps/server/templates/task-email.ts

commit a3f7c2e — 2026-02-01 — Maria Santos
    Refactor: normalize user contact info into user_contacts table

    - Created user_contacts table to support multiple contact types
      (phone, email, slack) per user
    - Migrated existing phone_number and email data to user_contacts
    - New user creation now writes to user_contacts instead of
      users.phone_number
    - NOTE: kept users.phone_number column for backwards compat,
      will remove in follow-up PR

    Files changed:
      apps/database/schema/users.ts
      apps/database/schema/user-contacts.ts (new)
      apps/database/migrations/0089_normalize-user-contacts.sql
      apps/server/routes/users.ts
      apps/server/routes/onboarding.ts

commit b8e1f4a — 2026-02-01 — Maria Santos
    Update user creation to write contacts to new table

    Files changed:
      apps/server/routes/users.ts
      apps/server/routes/onboarding.ts

commit 7c2e891 — 2026-01-28 — David Cho
    Add SMS notification support for task assignments

    Files changed:
      apps/server/services/notifications.ts (new)
      apps/server/routes/tasks.ts
```
