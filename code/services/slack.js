const { getUserContact } = require('../repositories/contacts-repo');
const { getUserById } = require('../repositories/user-repo');
const { ServiceError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const log = createLogger('slack-service');

const SLACK_WEBHOOK_BASE = process.env.SLACK_WEBHOOK_BASE || 'https://hooks.slack.com/services';

const postSlackMessage = async (slackUserId, message) => {
  const response = await fetch(`${SLACK_WEBHOOK_BASE}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel: slackUserId, text: message }),
  });

  if (!response.ok) {
    throw new ServiceError('Slack notification failed', {
      service: 'slack',
      operation: 'post_message',
    });
  }
};

const notifyUserBySlack = async (userId, message) => {
  const user = await getUserById(userId);
  const slackId = await getUserContact(userId, 'slack');

  if (!slackId) {
    log.warn('No Slack ID found for user, skipping Slack notification', { userId });
    return { sent: false, reason: 'no_slack_id' };
  }

  log.info('Sending Slack notification', { userId, slackId });

  try {
    await postSlackMessage(slackId, message);
    log.info('Slack notification sent', { userId, slackId });
    return { sent: true, channel: 'slack' };
  } catch (error) {
    log.error('Slack notification failed', { userId, error: error.message });
    throw error;
  }
};

module.exports = { notifyUserBySlack };
