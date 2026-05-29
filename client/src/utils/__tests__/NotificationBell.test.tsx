import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/helpers';
import NotificationBell from '../../features/notification/components/NotificationBell';
import type { AppNotification } from '../../features/notification/notificationSlice';

const mockNotification: AppNotification = {
  id: 'notif-1',
  type: 'task_created',
  message: 'New task created: "Test Task"',
  workspaceId: 'workspace-123',
  taskId: 'task-123',
  actorId: 'user-123',
  read: false,
  createdAt: new Date().toISOString(),
};

describe('NotificationBell', () => {
  it('renders bell icon', () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  it('shows unread count badge when notifications exist', () => {
    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notification: {
          notifications: [mockNotification],
          unreadCount: 1,
        },
      },
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows 9+ when unread count exceeds 9', () => {
    const notifications = Array.from({ length: 10 }, (_, i) => ({
      ...mockNotification,
      id: `notif-${i}`,
    }));

    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notification: {
          notifications,
          unreadCount: 10,
        },
      },
    });
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('does not show badge when no unread notifications', () => {
    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notification: {
          notifications: [],
          unreadCount: 0,
        },
      },
    });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    renderWithProviders(<NotificationBell />);
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('shows notifications in dropdown', () => {
    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notification: {
          notifications: [mockNotification],
          unreadCount: 1,
        },
      },
    });

    fireEvent.click(screen.getByText('🔔'));
    expect(
      screen.getByText('New task created: "Test Task"')
    ).toBeInTheDocument();
  });

  it('marks all as read when dropdown opens', () => {
    const { store } = renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notification: {
          notifications: [mockNotification],
          unreadCount: 1,
        },
      },
    });

    fireEvent.click(screen.getByText('🔔'));

    // unread count should be 0 after opening
    expect(store.getState().notification.unreadCount).toBe(0);
  });

  it('closes dropdown when backdrop clicked', () => {
    renderWithProviders(<NotificationBell />);

    // open dropdown
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // click backdrop
    fireEvent.click(document.querySelector('.fixed.inset-0')!);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });
});