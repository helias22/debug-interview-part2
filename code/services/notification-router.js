const { getChannelsForOrg } = require('../config/notification-config');
const { getUserContacts } = require('../repositories/contacts-repo');
const { notifyUserBySms } = require('./sms');
const { notifyUserByEmail } = require('./email');
const { notifyUserBySlack } = require('./slack');
const { createLogger } = require('../utils/logger');
const { db } = require('../db');
const { notificationsLog } = require('../schema');

const log = createLogger('notification-router');

const CONTACT_TYPE_TO_CHANNEL = {
  phone: 'sms',
  email: 'email',
  slack: 'slack',
};

const logNotification = async (organizationId, userId, channel, status, referenceType, errorMessage = null) => {
  await db.insert(notificationsLog).values({
    organizationId,
    userId,
    channel,
    status,
    referenceType,
    errorMessage,
    createdAt: Date.now(),
  });
};

const sendNotification = async (organizationId, userId, { smsBody, emailSubject, emailHtml, slackMessage, referenceType }) => {
  const orgChannels = await getChannelsForOrg(organizationId);

  // Look up what contact methods this user actually has
  const userContacts = await getUserContacts(userId);
  const userChannels = userContacts.map((c) => CONTACT_TYPE_TO_CHANNEL[c.contactType]).filter(Boolean);

  // If user has contacts in user_contacts, only dispatch to those channels
  // Otherwise fall back to all org-enabled channels (legacy users not yet migrated)
  const channels = {};
  if (userChannels.length > 0) {
    for (const channel of Object.keys(orgChannels)) {
      channels[channel] = orgChannels[channel] && userChannels.includes(channel);
    }
  } else {
    Object.assign(channels, orgChannels);
  }

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
      await logNotification(organizationId, userId, channel.name, 'sent', referenceType);
    } else {
      log.error(`${channel.name} notification failed`, {
        userId,
        error: result.reason?.message,
      });
      results.push({ sent: false, channel: channel.name, error: result.reason?.message });
      await logNotification(organizationId, userId, channel.name, 'failed', referenceType, result.reason?.message);
    }
  }

  return results;
};

module.exports = { sendNotification };
