const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel = process.env.LOG_LEVEL || 'info';

const formatTimestamp = () => new Date().toISOString();

const createLogger = (service) => {
  const write = (level, message, meta = {}) => {
    if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

    const entry = {
      timestamp: formatTimestamp(),
      level,
      service,
      message,
      ...meta,
    };

    const line = `${entry.timestamp} [${level.toUpperCase()}] [${service}] ${message}`;
    const metaKeys = Object.keys(meta);

    if (metaKeys.length > 0) {
      const metaStr = metaKeys.map((k) => `${k}=${JSON.stringify(meta[k])}`).join(' ');
      console.log(`${line} ${metaStr}`);
    } else {
      console.log(line);
    }
  };

  return {
    debug: (msg, meta) => write('debug', msg, meta),
    info: (msg, meta) => write('info', msg, meta),
    warn: (msg, meta) => write('warn', msg, meta),
    error: (msg, meta) => write('error', msg, meta),
  };
};

module.exports = { createLogger };
