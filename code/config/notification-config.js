const { eq } = require('drizzle-orm');
const { db } = require('../db');
const { organizations } = require('../schema');
const { createLogger } = require('../utils/logger');

const log = createLogger('notification-config');

// Default channel config per plan
const PLAN_DEFAULTS = {
  starter: { sms: false, email: true, slack: false },
  professional: { sms: true, email: true, slack: true },
  enterprise: { sms: true, email: true, slack: true },
};

// Per-org overrides (loaded from DB in production, hardcoded fallback)
const ORG_OVERRIDES = {};

const getChannelsForOrg = async (organizationId) => {
  const org = await db
    .select({ plan: organizations.plan })
    .from(organizations)
    .where(eq(organizations.organizationId, organizationId))
    .then(([r]) => r);

  if (!org) {
    log.warn('Organization not found for notification config', { organizationId });
    return PLAN_DEFAULTS.starter;
  }

  const defaults = PLAN_DEFAULTS[org.plan] || PLAN_DEFAULTS.starter;
  const overrides = ORG_OVERRIDES[organizationId] || {};

  return { ...defaults, ...overrides };
};

const isChannelEnabled = async (organizationId, channel) => {
  const channels = await getChannelsForOrg(organizationId);
  return channels[channel] === true;
};

module.exports = { getChannelsForOrg, isChannelEnabled };
