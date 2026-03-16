const { eq, and } = require('drizzle-orm');
const { db } = require('../db');
const { userContacts } = require('../schema');
const { createLogger } = require('../utils/logger');

const log = createLogger('contacts-repo');

const getUserContact = async (userId, contactType) => {
  const row = await db
    .select()
    .from(userContacts)
    .where(and(eq(userContacts.userId, userId), eq(userContacts.contactType, contactType)))
    .then(([r]) => r);

  return row?.contactValue || null;
};

const getPrimaryContact = async (userId, contactType) => {
  const row = await db
    .select()
    .from(userContacts)
    .where(
      and(
        eq(userContacts.userId, userId),
        eq(userContacts.contactType, contactType),
        eq(userContacts.isPrimary, true)
      )
    )
    .then(([r]) => r);

  return row?.contactValue || null;
};

const upsertContact = async (userId, contactType, contactValue, isPrimary = false) => {
  const existing = await getUserContact(userId, contactType);

  if (existing) {
    const updated = await db
      .update(userContacts)
      .set({ contactValue, isPrimary })
      .where(and(eq(userContacts.userId, userId), eq(userContacts.contactType, contactType)))
      .returning()
      .then(([r]) => r);

    log.info('Contact updated', { userId, contactType });
    return updated;
  }

  const created = await db
    .insert(userContacts)
    .values({ userId, contactType, contactValue, isPrimary, createdAt: Date.now() })
    .returning()
    .then(([r]) => r);

  log.info('Contact created', { userId, contactType });
  return created;
};

const getUserContacts = async (userId) => {
  return db
    .select()
    .from(userContacts)
    .where(eq(userContacts.userId, userId));
};

module.exports = { getUserContact, getUserContacts, getPrimaryContact, upsertContact };
