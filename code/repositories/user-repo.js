const { eq, and, isNull } = require('drizzle-orm');
const { db } = require('../db');
const { users } = require('../schema');
const { NotFoundError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const log = createLogger('user-repo');

const getUserById = async (userId) => {
  const row = await db
    .select()
    .from(users)
    .where(and(eq(users.userId, userId), isNull(users.deletedAt)))
    .then(([r]) => r);

  if (!row) throw new NotFoundError('User', userId);
  return row;
};

const getUsersByOrg = async (organizationId) => {
  return db
    .select()
    .from(users)
    .where(and(eq(users.organizationId, organizationId), isNull(users.deletedAt)));
};

const getUserPhone = async (userId) => {
  const row = await db
    .select({ phoneNumber: users.phone_number })
    .from(users)
    .where(eq(users.userId, userId))
    .then(([r]) => r);

  return row?.phoneNumber || null;
};

const updateUser = async (userId, data) => {
  const updated = await db
    .update(users)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(users.userId, userId))
    .returning()
    .then(([r]) => r);

  if (!updated) throw new NotFoundError('User', userId);
  log.info('User updated', { userId });
  return updated;
};

module.exports = { getUserById, getUsersByOrg, getUserPhone, updateUser };
