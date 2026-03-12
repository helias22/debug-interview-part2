const { createLogger } = require('../utils/logger');

const log = createLogger('auth');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing authorization token' });
  }

  try {
    const session = await verifyToken(token);
    req.user = {
      userId: session.userId,
      email: session.email,
      role: session.role,
    };
    log.info('Request authenticated', { userId: session.userId });
    next();
  } catch (error) {
    log.warn('Authentication failed', { error: error.message });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

const verifyToken = async (token) => {
  // Stytch session verification
  const response = await fetch(`${process.env.STYTCH_API_URL}/v1/sessions/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({ session_token: token }),
  });

  if (!response.ok) throw new Error('Session verification failed');
  const data = await response.json();
  return data.session;
};

module.exports = { authenticate };
