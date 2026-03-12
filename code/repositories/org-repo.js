const { eq } = require('drizzle-orm');
const { db } = require('../db');
const { organizations } = require('../schema');
const { NotFoundError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const log = createLogger('org-repo');

const getOrgById = async (organizationId) => {
  const row = await db
    .select()
    .from(organizations)
    .where(eq(organizations.organizationId, organizationId))
    .then(([r]) => r);

  if (!row) throw new NotFoundError('Organization', organizationId);
  return row;
};

const getOrgBySlug = async (slug) => {
  const row = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .then(([r]) => r);

  if (!row) throw new NotFoundError('Organization', slug);
  return row;
};

const listOrgs = async () => {
  return db.select().from(organizations);
};

const updateOrg = async (organizationId, data) => {
  const updated = await db
    .update(organizations)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(organizations.organizationId, organizationId))
    .returning()
    .then(([r]) => r);

  if (!updated) throw new NotFoundError('Organization', organizationId);
  log.info('Organization updated', { organizationId });
  return updated;
};

module.exports = { getOrgById, getOrgBySlug, listOrgs, updateOrg };
