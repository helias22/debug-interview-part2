const { getChannelsForOrg } = require('../config/notification-config');
const { notifyUserBySms } = require('./sms');
const { notifyUserByEmail } = require('./email');
const { notifyUserBySlack } = require('./slack');
const { createLogger } = require('../utils/logger');
const { db } = require('../db');
const { notificationsLog } = require('../schema');

const log = createLogger('notification-router');

const logNotification = async (organizationId, userId, channel, status, errorMessage = null) => {
  await db.insert(notificationsLog).values({
    organizationId,
    userId,
    channel,
    status,
    errorMessage,
    createdAt: Date.now(),
  });
};

const sendNotification = async (organizationId, userId, { smsBody, emailSubject, emailHtml, slackMessage }) => {
  const channels = await getChannelsForOrg(organizationId);
  log.info('Routing notification', { organizationId, userId, channels });

  const results = [];

  const channelHandlers = [
    {
      name: 'sms',
      enabled: channels.sms,
      handler: () => notifyUserBySms(userId, smsBody || slackMessage),
    },
    {
      name: 'email',
      enabled: channels.email,
      handler: () => notifyUserByEmail(userId, emailSubject || 'Notification', emailHtml || slackMessage),
    },
    {
      name: 'slack',
      enabled: channels.slack,
      handler: () => notifyUserBySlack(userId, slackMessage || smsBody),
    },
  ];

  const enabled = channelHandlers.filter((c) => c.enabled);
  log.info(`Dispatching to ${enabled.length} channel(s)`, { organizationId, userId });

  const settled = await Promise.allSettled(enabled.map((c) => c.handler()));

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    const channel = enabled[i];

    if (result.status === 'fulfilled') {
      results.push(result.value);
      await logNotification(organizationId, userId, channel.name, 'sent');
    } else {
      log.error(`${channel.name} notification failed`, {
        userId,
        error: result.reason?.message,
      });
      results.push({ sent: false, channel: channel.name, error: result.reason?.message });
      await logNotification(organizationId, userId, channel.name, 'failed', result.reason?.message);
    }
  }

  return results;
};

module.exports = { sendNotification };
