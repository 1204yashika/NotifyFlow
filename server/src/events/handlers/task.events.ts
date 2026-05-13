import { appEvents } from '../eventEmitter.js';
import { Events } from '../events.js';
import { notifyWorkspace } from '../../utils/notify.js';
import { emailQueue } from '../../queues/index.js';
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
          await emailQueue.add('task_assigned', {
            type: 'task_assigned',
            to: assignee.email,
            taskTitle: task.title,
            workspaceName: workspace.name,
            assignedBy: actor.name,
          });
        }
      }
    } catch (err) {
      // log but never crash — email is non-critical
      console.error('Failed to enqueue task assignment email:', err);
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