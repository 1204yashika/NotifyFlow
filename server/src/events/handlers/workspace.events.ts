import { appEvents } from '../eventEmitter.js';
import { Events } from '../events.js';
import { notifyWorkspace, notifyUser } from '../../utils/notify.js';

export function registerWorkspaceEventHandlers() {
  appEvents.on(Events.MEMBER_INVITED, (payload) => {
    // notify the invited user personally
    notifyUser(payload.userId, {
      type: 'member_invited',
      ...payload,
    });

    // notify all workspace members
    notifyWorkspace(payload.workspaceId, {
      type: 'member_invited',
      ...payload,
    });
  });

  appEvents.on(Events.MEMBER_REMOVED, (payload) => {
    notifyWorkspace(payload.workspaceId, {
      type: 'member_removed',
      ...payload,
    });
  });
}