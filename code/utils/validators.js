const { ValidationError } = require('./errors');

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateUUID = (value, fieldName = 'id') => {
  if (!value || !UUID_REGEX.test(value)) {
    throw new ValidationError(`Invalid UUID format for ${fieldName}`, [fieldName]);
  }
  return value;
};

const validatePhone = (value) => {
  if (!value || !PHONE_REGEX.test(value.replace(/[\s\-()]/g, ''))) {
    throw new ValidationError('Invalid phone number format', ['phone']);
  }
  return value.replace(/[\s\-()]/g, '');
};

const validateEmail = (value) => {
  if (!value || !EMAIL_REGEX.test(value)) {
    throw new ValidationError('Invalid email format', ['email']);
  }
  return value.toLowerCase().trim();
};

const requireFields = (obj, fields) => {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`, missing);
  }
};

module.exports = { validateUUID, validatePhone, validateEmail, requireFields };
