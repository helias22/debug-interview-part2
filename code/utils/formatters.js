const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, 3) + '*'.repeat(phone.length - 5) + phone.slice(-2);
};

const maskEmail = (email) => {
  if (!email) return '***';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.charAt(0) + '*'.repeat(Math.max(local.length - 2, 1)) + local.slice(-1);
  return `${masked}@${domain}`;
};

const formatDisplayName = (user) => {
  if (!user) return 'Unknown';
  return user.displayName || user.email.split('@')[0];
};

const truncate = (str, maxLen = 100) => {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
};

const toEpochMs = (date = new Date()) => {
  return date instanceof Date ? date.getTime() : Date.now();
};

module.exports = { maskPhone, maskEmail, formatDisplayName, truncate, toEpochMs };
