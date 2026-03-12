const { getUserContact } = require('../repositories/contacts-repo');
const { getUserById } = require('../repositories/user-repo');
const { ServiceError } = require('../utils/errors');
const { maskEmail, formatDisplayName } = require('../utils/formatters');
const { createLogger } = require('../utils/logger');

const log = createLogger('email-service');

const SENDGRID_URL = process.env.SENDGRID_URL || 'https://api.sendgrid.com/v3/mail/send';
const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@taskflow.io';

const sendEmail = async (to, subject, htmlBody) => {
  const response = await fetch(SENDGRID_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: 'TaskFlow' },
      subject,
      content: [{ type: 'text/html', value: htmlBody }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => 'unknown');
    throw new ServiceError(`Email delivery failed: ${detail}`, {
      service: 'sendgrid',
      operation: 'send',
    });
  }
};

const notifyUserByEmail = async (userId, subject, htmlBody) => {
  const user = await getUserById(userId);
  const email = await getUserContact(userId, 'email');

  if (!email) {
    log.warn('No email contact found for user, skipping email', { userId });
    return { sent: false, reason: 'no_email' };
  }

  const displayName = formatDisplayName(user);
  log.info('Sending email notification', { userId, email: maskEmail(email) });

  try {
    await sendEmail(email, subject, htmlBody);
    log.info('Email sent successfully', { userId, to: maskEmail(email) });
    return { sent: true, channel: 'email' };
  } catch (error) {
    log.error('Email delivery failed', { userId, error: error.message });
    throw error;
  }
};

module.exports = { notifyUserByEmail };
