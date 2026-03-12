# git show 1f7b9d4

```diff
commit 1f7b9d4
Author: James Chen <jchen@taskflow.io>
Date:   Tue Mar 18 10:33:08 2025

    feat: add user_contacts table for multiple contact types

    - Created user_contacts table to support multiple contact types
    - New user creation now writes to user_contacts instead of users.phone_number
    - NOTE: kept users.phone_number column for backwards compat, will remove in follow-up PR

diff --git a/migrations/0042_create-user-contacts-table.sql b/migrations/0042_create-user-contacts-table.sql
new file mode 100644
--- /dev/null
+++ b/migrations/0042_create-user-contacts-table.sql
@@ -0,0 +1,13 @@
+CREATE TABLE user_contacts (
+  contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
+  user_id UUID NOT NULL REFERENCES users(user_id),
+  contact_type VARCHAR(20) NOT NULL,
+  contact_value VARCHAR(255) NOT NULL,
+  is_primary BOOLEAN NOT NULL DEFAULT false,
+  verified BOOLEAN NOT NULL DEFAULT false,
+  created_at BIGINT NOT NULL
+);
+
+CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);
+CREATE INDEX idx_user_contacts_type ON user_contacts(user_id, contact_type);

diff --git a/code/repositories/contacts-repo.js b/code/repositories/contacts-repo.js
new file mode 100644
--- /dev/null
+++ b/code/repositories/contacts-repo.js
@@ -0,0 +1,55 @@
+const { eq, and } = require('drizzle-orm');
+const { db } = require('../db');
+const { userContacts } = require('../schema');
+const { createLogger } = require('../utils/logger');
+
+const log = createLogger('contacts-repo');
+
+const getUserContact = async (userId, contactType) => {
+...
+(full file as shown in contacts-repo.js)

diff --git a/code/services/email.js b/code/services/email.js
--- a/code/services/email.js
+++ b/code/services/email.js
@@ -1,5 +1,5 @@
-const { getUserById } = require('../repositories/user-repo');
+const { getUserContact } = require('../repositories/contacts-repo');
+const { getUserById } = require('../repositories/user-repo');

@@ -34,8 +34,8 @@
 const notifyUserByEmail = async (userId, subject, htmlBody) => {
   const user = await getUserById(userId);
-  const email = user.email;
+  const email = await getUserContact(userId, 'email');

diff --git a/code/schema.js b/code/schema.js
--- a/code/schema.js
+++ b/code/schema.js
@@ -20,6 +20,7 @@
   role: varchar('role', { length: 50 }).notNull().default('member'),
-  phone_number: varchar('phone_number', { length: 20 }),
+  phone_number: varchar('phone_number', { length: 20 }), // Legacy column — kept for backward compat
   createdAt: bigint('created_at', { mode: 'number' }).notNull(),

@@ -24,0 +25,14 @@
+// ── User Contacts ──────────────────────────────────────────────
+const userContacts = pgTable('user_contacts', {
+  contactId: uuid('contact_id').primaryKey().defaultRandom(),
+  userId: uuid('user_id').notNull().references(() => users.userId),
+  contactType: varchar('contact_type', { length: 20 }).notNull(),
+  contactValue: varchar('contact_value', { length: 255 }).notNull(),
+  isPrimary: boolean('is_primary').notNull().default(false),
+  verified: boolean('verified').notNull().default(false),
+  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
+});
```
