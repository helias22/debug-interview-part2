const { getOrgBySlug } = require('../repositories/org-repo');
const { createLogger } = require('../utils/logger');

const log = createLogger('org-context');

const extractOrgContext = async (req, res, next) => {
  const orgSlug = req.headers['x-org-slug'] || req.params.orgSlug;

  if (!orgSlug) {
    return res.status(400).json({ error: 'BadRequest', message: 'Missing organization context' });
  }

  try {
    const org = await getOrgBySlug(orgSlug);
    req.orgContext = {
      organizationId: org.organizationId,
      orgName: org.name,
      plan: org.plan,
    };
    log.info('Org context set', { orgSlug, organizationId: org.organizationId });
    next();
  } catch (error) {
    log.warn('Failed to resolve org context', { orgSlug, error: error.message });
    res.status(404).json({ error: 'NotFound', message: 'Organization not found' });
  }
};

module.exports = { extractOrgContext };
