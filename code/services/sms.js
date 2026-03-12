const { getUserPhone } = require('../repositories/user-repo');
const { getUserById } = require('../repositories/user-repo');
const { ServiceError } = require('../utils/errors');
const { maskPhone } = require('../utils/formatters');
const { createLogger } = require('../utils/logger');

const log = createLogger('sms-service');

const SMS_PROVIDER_URL = process.env.SMS_PROVIDER_URL || 'https://api.twilsend.com/v1/messages';
const SMS_FROM_NUMBER = process.env.SMS_FROM_NUMBER || '+18005551000';

const sendSms = async (to, body) => {
  const response = await fetch(SMS_PROVIDER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SMS_API_KEY}`,
    },
    body: JSON.stringify({ from: SMS_FROM_NUMBER, to, body }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => 'unknown');
    throw new ServiceError(`SMS delivery failed: ${detail}`, {
      service: 'sms-provider',
      operation: 'send',
    });
  }

  return response.json();
};

const notifyUserBySms = async (userId, message) => {
  const user = await getUserById(userId);
  const phone = await getUserPhone(userId);

  if (!phone) {
    log.warn('No phone number found for user, skipping SMS', {
      userId,
      userName: user.displayName,
    });
    return { sent: false, reason: 'no_phone' };
  }

  log.info('Sending SMS notification', { userId, phone: maskPhone(phone) });

  try {
    await sendSms(phone, message);
    log.info('SMS sent successfully', { userId, phone: maskPhone(phone) });
    return { sent: true, channel: 'sms' };
  } catch (error) {
    log.error('SMS delivery failed', {
      userId,
      phone: maskPhone(phone),
      error: error.message,
    });
    throw error;
  }
};

module.exports = { notifyUserBySms };
