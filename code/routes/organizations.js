const { Router } = require('express');
const { getOrgById, updateOrg } = require('../repositories/org-repo');
const { getUsageSummary, checkQuota } = require('../services/billing');
const { validateUUID } = require('../utils/validators');
const { handleRouteError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const log = createLogger('orgs-route');
const router = Router();

router.get('/current', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    const org = await getOrgById(organizationId);
    res.json({ data: org });
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.patch('/current', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    const updated = await updateOrg(organizationId, req.body);
    log.info('Organization updated', { organizationId });
    res.json({ data: updated });
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.get('/current/usage', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const summary = await getUsageSummary(organizationId, now.getTime(), periodEnd.getTime());
    res.json({ data: summary });
  } catch (error) {
    handleRouteError(res, error);
  }
});

module.exports = router;
