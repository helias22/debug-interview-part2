const { eq, and, isNull } = require('drizzle-orm');
const { db } = require('../db');
const { tasks } = require('../schema');
const { NotFoundError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const log = createLogger('task-repo');

const getTaskById = async (taskId, organizationId) => {
  const row = await db
    .select()
    .from(tasks)
    .where(
      and(eq(tasks.taskId, taskId), eq(tasks.organizationId, organizationId), isNull(tasks.deletedAt))
    )
    .then(([r]) => r);

  if (!row) throw new NotFoundError('Task', taskId);
  return row;
};

const getTasksByOrg = async (organizationId, { status, assigneeId } = {}) => {
  let query = db
    .select()
    .from(tasks)
    .where(and(eq(tasks.organizationId, organizationId), isNull(tasks.deletedAt)));

  if (status) query = query.where(eq(tasks.status, status));
  if (assigneeId) query = query.where(eq(tasks.assigneeId, assigneeId));

  return query;
};

const updateTask = async (taskId, organizationId, data) => {
  const updated = await db
    .update(tasks)
    .set({ ...data, updatedAt: Date.now() })
    .where(and(eq(tasks.taskId, taskId), eq(tasks.organizationId, organizationId)))
    .returning()
    .then(([r]) => r);

  if (!updated) throw new NotFoundError('Task', taskId);
  log.info('Task updated', { taskId, organizationId, fields: Object.keys(data) });
  return updated;
};

const createTask = async (data) => {
  const now = Date.now();
  const created = await db
    .insert(tasks)
    .values({ ...data, createdAt: now, updatedAt: now })
    .returning()
    .then(([r]) => r);

  log.info('Task created', { taskId: created.taskId, organizationId: data.organizationId });
  return created;
};

module.exports = { getTaskById, getTasksByOrg, updateTask, createTask };
