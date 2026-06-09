import { appEvents } from '../eventEmitter.js';
import { Events } from '../events.js';
import { notifyWorkspace } from '../../utils/notify.js';
import { emailQueue } from '../../queues/index.js';
import { sendTaskAssignedEmail } from '../../queues/jobs/sendTaskAssigned.js';
import { logger } from '../../config/logger.js';
import { findById as findUserById } from '../../modules/user/user.repository.js';
import { findById as findWorkspaceById } from '../../modules/workspace/workspace.repository.js';
import type { ITask } from '../../modules/task/task.model.js';


export function registerTaskEventHandlers() {
  appEvents.on(Events.TASK_CREATED, async (payload) => {
    notifyWorkspace(payload.workspaceId, {
      type: 'task_created',
      ...payload,
    });

    // email notification if task is assigned
    try {
      const task = payload.data as ITask;
      if (task.assignedTo) {
        const [assignee, workspace, actor] = await Promise.all([
          findUserById(String(task.assignedTo)),
          findWorkspaceById(payload.workspaceId),
          findUserById(payload.actorId),
        ]);

        if (assignee && workspace && actor) {
          const emailData = {
            to: assignee.email,
            taskTitle: task.title,
            workspaceName: workspace.name,
            assignedBy: actor.name,
          };
          try {
            await emailQueue.add('task_assigned', { type: 'task_assigned', ...emailData });
          } catch {
            // Redis unavailable — send directly via SMTP
            logger.warn('Email queue unavailable, sending task assignment email directly');
            await sendTaskAssignedEmail(emailData);
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'Failed to send task assignment email');
    }
  });

  appEvents.on(Events.TASK_UPDATED, (payload) => {
    notifyWorkspace(payload.workspaceId, {
      type: 'task_updated',
      ...payload,
    });
  });

  appEvents.on(Events.TASK_DELETED, (payload) => {
    notifyWorkspace(payload.workspaceId, {
      type: 'task_deleted',
      ...payload,
    });
  });
}