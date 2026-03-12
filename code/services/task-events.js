const { sendNotification } = require('./notification-router');
const { getUserById } = require('../repositories/user-repo');
const { formatDisplayName, truncate } = require('../utils/formatters');
const { createLogger } = require('../utils/logger');

const log = createLogger('task-events');

const onTaskAssigned = async (task, assigneeId, organizationId) => {
  const assignee = await getUserById(assigneeId);
  const assigner = await getUserById(task.createdBy);

  const assignerName = formatDisplayName(assigner);
  const taskTitle = truncate(task.title, 60);

  log.info('Task assigned, sending notifications', {
    taskId: task.taskId,
    assigneeId,
    organizationId,
  });

  const smsBody = `${assignerName} assigned you a task: "${taskTitle}"`;
  const slackMessage = `*New task assigned*\n${assignerName} assigned you: *${taskTitle}*`;
  const emailSubject = `Task assigned: ${taskTitle}`;
  const emailHtml = `
    <h3>New Task Assignment</h3>
    <p><strong>${assignerName}</strong> assigned you a task:</p>
    <p><em>${task.title}</em></p>
    <p>${task.description || ''}</p>
  `;

  try {
    const results = await sendNotification(organizationId, assigneeId, {
      smsBody,
      emailSubject,
      emailHtml,
      slackMessage,
    });

    const sent = results.filter((r) => r.sent).length;
    log.info('Task assignment notifications dispatched', {
      taskId: task.taskId,
      channelsSent: sent,
      totalChannels: results.length,
    });
  } catch (error) {
    log.error('Failed to send task assignment notifications', {
      taskId: task.taskId,
      assigneeId,
      error: error.message,
    });
  }
};

const onTaskStatusChanged = async (task, previousStatus, organizationId) => {
  if (!task.assigneeId) return;

  log.info('Task status changed', {
    taskId: task.taskId,
    from: previousStatus,
    to: task.status,
  });

  const message = `Task "${truncate(task.title, 40)}" moved from ${previousStatus} to ${task.status}`;

  await sendNotification(organizationId, task.assigneeId, {
    smsBody: message,
    slackMessage: message,
    emailSubject: `Task update: ${truncate(task.title, 40)}`,
    emailHtml: `<p>${message}</p>`,
  });
};

module.exports = { onTaskAssigned, onTaskStatusChanged };
