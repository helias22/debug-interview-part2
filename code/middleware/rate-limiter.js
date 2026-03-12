const { createLogger } = require('../utils/logger');

const log = createLogger('rate-limiter');

const windowMs = 60 * 1000;
const maxRequests = Number(process.env.RATE_LIMIT_MAX) || 100;

const buckets = new Map();

const rateLimiter = (req, res, next) => {
  const key = `${req.ip}:${req.orgContext?.organizationId || 'anon'}`;
  const now = Date.now();

  if (!buckets.has(key)) {
    buckets.set(key, { count: 1, windowStart: now });
    return next();
  }

  const bucket = buckets.get(key);

  if (now - bucket.windowStart > windowMs) {
    bucket.count = 1;
    bucket.windowStart = now;
    return next();
  }

  bucket.count++;

  if (bucket.count > maxRequests) {
    log.warn('Rate limit exceeded', { ip: req.ip, key });
    return res.status(429).json({ error: 'TooManyRequests', message: 'Rate limit exceeded' });
  }

  next();
};

module.exports = { rateLimiter };
