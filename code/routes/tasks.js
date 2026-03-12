const { Router } = require('express');
const { getTaskById, updateTask, createTask, getTasksByOrg } = require('../repositories/task-repo');
const { onTaskAssigned, onTaskStatusChanged } = require('../services/task-events');
const { trackUsage, METRIC_TYPES } = require('../services/billing');
const { validateUUID, requireFields } = require('../utils/validators');
const { handleRouteError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const log = createLogger('tasks-route');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    const tasks = await getTasksByOrg(organizationId, {
      status: req.query.status,
      assigneeId: req.query.assigneeId,
    });
    res.json({ data: tasks });
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    requireFields(req.body, ['title', 'createdBy']);
    const task = await createTask({ ...req.body, organizationId });
    await trackUsage(organizationId, METRIC_TYPES.TASK_CREATED);
    log.info('Task created via API', { taskId: task.taskId });
    res.status(201).json({ data: task });
  } catch (error) {
    handleRouteError(res, error);
  }
});

router.patch('/:taskId', async (req, res) => {
  try {
    const { organizationId } = req.orgContext;
    const { taskId } = req.params;
    validateUUID(taskId, 'taskId');

    const previous = await getTaskById(taskId, organizationId);
    const updated = await updateTask(taskId, organizationId, req.body);

    if (req.body.assigneeId && req.body.assigneeId !== previous.assigneeId) {
      log.info('Task reassigned, triggering notifications', { taskId });
      await onTaskAssigned(updated, req.body.assigneeId, organizationId);
    }

    if (req.body.status && req.body.status !== previous.status) {
      await onTaskStatusChanged(updated, previous.status, organizationId);
    }

    res.json({ data: updated });
  } catch (error) {
    handleRouteError(res, error);
  }
});

module.exports = router;
