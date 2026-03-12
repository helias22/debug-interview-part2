const { pgTable, text, bigint, uuid, varchar, boolean, jsonb } = require('drizzle-orm/pg-core');

// ── Organizations ──────────────────────────────────────────────
const organizations = pgTable('organizations', {
  organizationId: uuid('organization_id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  plan: varchar('plan', { length: 50 }).notNull().default('starter'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
});

// ── Users ──────────────────────────────────────────────────────
const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.organizationId),
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  phone_number: varchar('phone_number', { length: 20 }), // Legacy column — kept for backward compat
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  deletedAt: bigint('deleted_at', { mode: 'number' }),
});

// ── User Contacts ──────────────────────────────────────────────
const userContacts = pgTable('user_contacts', {
  contactId: uuid('contact_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.userId),
  contactType: varchar('contact_type', { length: 20 }).notNull(), // 'phone', 'email', 'slack'
  contactValue: varchar('contact_value', { length: 255 }).notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// ── Tasks ──────────────────────────────────────────────────────
const tasks = pgTable('tasks', {
  taskId: uuid('task_id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.organizationId),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 30 }).notNull().default('open'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  assigneeId: uuid('assignee_id').references(() => users.userId),
  createdBy: uuid('created_by').notNull().references(() => users.userId),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  deletedAt: bigint('deleted_at', { mode: 'number' }),
});

// ── Notifications Log ──────────────────────────────────────────
const notificationsLog = pgTable('notifications_log', {
  notificationId: uuid('notification_id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.organizationId),
  userId: uuid('user_id').notNull().references(() => users.userId),
  channel: varchar('channel', { length: 20 }).notNull(), // 'sms', 'email', 'slack'
  status: varchar('status', { length: 20 }).notNull(), // 'sent', 'failed', 'pending'
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  errorMessage: text('error_message'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// ── Billing Usage ──────────────────────────────────────────────
const billingUsage = pgTable('billing_usage', {
  usageId: uuid('usage_id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.organizationId),
  metricType: varchar('metric_type', { length: 50 }).notNull(),
  quantity: bigint('quantity', { mode: 'number' }).notNull(),
  periodStart: bigint('period_start', { mode: 'number' }).notNull(),
  periodEnd: bigint('period_end', { mode: 'number' }).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

module.exports = {
  organizations,
  users,
  userContacts,
  tasks,
  notificationsLog,
  billingUsage,
};
