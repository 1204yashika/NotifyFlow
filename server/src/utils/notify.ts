import { getIO } from '../config/socket.js';

export type NotificationPayload = {
  type:
    | 'task_created'
    | 'task_updated'
    | 'task_deleted'
    | 'member_invited'
    | 'member_removed';
  workspaceId?: string;
  taskId?: string;
  actorId: string;
  data: unknown;
};

// emit to all members of a workspace
export function notifyWorkspace(
  workspaceId: string,
  payload: NotificationPayload
): void {
  try {
    getIO().to(`workspace:${workspaceId}`).emit('notification', payload);
  } catch (err) {
    // never crash the app if socket fails
    console.error('Failed to emit workspace notification:', err);
  }
}

// emit to a specific user across all their devices/tabs
export function notifyUser(
  userId: string,
  payload: NotificationPayload
): void {
  try {
    getIO().to(`user:${userId}`).emit('notification', payload);
  } catch (err) {
    console.error('Failed to emit user notification:', err);
  }
}