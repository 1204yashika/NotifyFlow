import { describe, it, expect } from 'vitest';
import notificationReducer, {
  addNotification,
  markAllRead,
  clearNotifications,
  selectNotifications,
  selectUnreadCount,
} from '../../features/notification/notificationSlice';
import type { AppNotification } from  '../../features/notification/notificationSlice';

const mockNotification: AppNotification = {
  id: 'notif-1',
  type: 'task_created',
  message: 'New task created: "Test Task"',
  workspaceId: 'workspace-123',
  taskId: 'task-123',
  actorId: 'user-123',
  read: false,
  createdAt: '2026-05-21T04:43:59.670Z',
};

describe('notificationSlice', () => {
  const initialState = {
    notifications: [],
    unreadCount: 0,
  };

  describe('addNotification', () => {
    it('adds notification to the list', () => {
      const state = notificationReducer(
        initialState,
        addNotification(mockNotification)
      );
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]).toEqual(mockNotification);
    });

    it('increments unread count', () => {
      const state = notificationReducer(
        initialState,
        addNotification(mockNotification)
      );
      expect(state.unreadCount).toBe(1);
    });

    it('adds newest notification at the top', () => {
      const first = { ...mockNotification, id: 'notif-1' };
      const second = { ...mockNotification, id: 'notif-2' };

      let state = notificationReducer(initialState, addNotification(first));
      state = notificationReducer(state, addNotification(second));

      expect(state.notifications[0].id).toBe('notif-2'); // newest first
      expect(state.notifications[1].id).toBe('notif-1');
    });

    it('keeps only last 50 notifications', () => {
      let state:any = initialState;

      // add 55 notifications
      for (let i = 0; i < 55; i++) {
        state = notificationReducer(
          state,
          addNotification({ ...mockNotification, id: `notif-${i}` })
        );
      }

      expect(state.notifications).toHaveLength(50);
	  expect(state.notifications[0].id).toBe('notif-54')
    });
  });

  describe('markAllRead', () => {
    it('marks all notifications as read', () => {
      const stateWithNotifs = {
        notifications: [
          { ...mockNotification, read: false },
          { ...mockNotification, id: 'notif-2', read: false },
        ],
        unreadCount: 2,
      };

      const state = notificationReducer(stateWithNotifs, markAllRead());

      expect(state.notifications.every(n => n.read)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('does nothing when no notifications', () => {
      const state = notificationReducer(initialState, markAllRead());
      expect(state.unreadCount).toBe(0);
      expect(state.notifications).toHaveLength(0);
    });
  });

  describe('clearNotifications', () => {
    it('clears all notifications and resets count', () => {
      const stateWithNotifs = {
        notifications: [mockNotification],
        unreadCount: 1,
      };
      const state = notificationReducer(stateWithNotifs, clearNotifications());
      expect(state.notifications).toHaveLength(0);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('selectors', () => {
    const rootState = {
      notification: {
        notifications: [mockNotification],
        unreadCount: 1,
      },
    } as any;

    it('selectNotifications returns notifications', () => {
      expect(selectNotifications(rootState)).toHaveLength(1);
    });

    it('selectUnreadCount returns count', () => {
      expect(selectUnreadCount(rootState)).toBe(1);
    });
  });
});