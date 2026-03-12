const { eq, and, gte, lte } = require('drizzle-orm');
const { db } = require('../db');
const { billingUsage, organizations } = require('../schema');
const { createLogger } = require('../utils/logger');

const log = createLogger('billing');

const METRIC_TYPES = {
  NOTIFICATION_SMS: 'notification_sms',
  NOTIFICATION_EMAIL: 'notification_email',
  TASK_CREATED: 'task_created',
  API_CALL: 'api_call',
};

const trackUsage = async (organizationId, metricType, quantity = 1) => {
  const now = Date.now();
  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);

  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.insert(billingUsage).values({
    organizationId,
    metricType,
    quantity,
    periodStart: periodStart.getTime(),
    periodEnd: periodEnd.getTime(),
    createdAt: now,
  });

  log.info('Usage tracked', { organizationId, metricType, quantity });
};

const getUsageSummary = async (organizationId, periodStart, periodEnd) => {
  const rows = await db
    .select()
    .from(billingUsage)
    .where(
      and(
        eq(billingUsage.organizationId, organizationId),
        gte(billingUsage.periodStart, periodStart),
        lte(billingUsage.periodEnd, periodEnd)
      )
    );

  const summary = {};
  for (const row of rows) {
    summary[row.metricType] = (summary[row.metricType] || 0) + row.quantity;
  }

  return summary;
};

const checkQuota = async (organizationId, metricType) => {
  const org = await db
    .select({ plan: organizations.plan })
    .from(organizations)
    .where(eq(organizations.organizationId, organizationId))
    .then(([r]) => r);

  const limits = {
    starter: { notification_sms: 100, notification_email: 500, task_created: 50 },
    professional: { notification_sms: 1000, notification_email: 5000, task_created: 500 },
    enterprise: { notification_sms: -1, notification_email: -1, task_created: -1 },
  };

  const planLimits = limits[org?.plan || 'starter'];
  const limit = planLimits[metricType];

  if (limit === -1) return { allowed: true, remaining: Infinity };

  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const usage = await getUsageSummary(organizationId, now.getTime(), periodEnd.getTime());
  const current = usage[metricType] || 0;

  return { allowed: current < limit, remaining: Math.max(0, limit - current) };
};

module.exports = { trackUsage, getUsageSummary, checkQuota, METRIC_TYPES };
