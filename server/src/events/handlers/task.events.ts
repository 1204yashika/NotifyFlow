import { appEvents } from '../eventEmitter.js';
import { Events } from '../events.js';
import { notifyWorkspace } from '../../utils/notify.js';

export function registerTaskEventHandlers() {
  appEvents.on(Events.TASK_CREATED, (payload) => {
    notifyWorkspace(payload.workspaceId, {
      type: 'task_created',
      ...payload,
    });
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