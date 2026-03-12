const { Router } = require('express');
const { eq, and, desc } = require('drizzle-orm');
const { db } = require('../db');
const { notificationsLog } = require('../schema');
const { validateUUID } = require('../utils/validators');
const { handleRouteError } = require('../utils/errors');

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    const { userId, channel, limit = 50 } = req.query;

    let conditions = [eq(notificationsLog.organizationId, organizationId)];

    if (userId) {
      validateUUID(userId, 'userId');
      conditions.push(eq(notificationsLog.userId, userId));
    }
    if (channel) {
      conditions.push(eq(notificationsLog.channel, channel));
    }

    const logs = await db
      .select()
      .from(notificationsLog)
      .where(and(...conditions))
      .orderBy(desc(notificationsLog.createdAt))
      .limit(Number(limit));

    const summary = {
      total: logs.length,
      sent: logs.filter((l) => l.status === 'sent').length,
      failed: logs.filter((l) => l.status === 'failed').length,
    };

    res.json({ data: logs, summary });
  } catch (error) {
    handleRouteError(res, error);
  }
});

module.exports = router;
