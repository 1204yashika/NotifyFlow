import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { selectAccessToken } from '../features/auth/authSlice';
import { connectSocket, disconnectSocket } from '../services/socket';
import { addNotification } from '../features/notification/notificationSlice';
import { taskApi } from '../features/task/taskApi';
import { baseApi } from '../services/baseApi';
import toast from 'react-hot-toast';
import type { AppNotification } from '../features/notification/notificationSlice';
import type { Task } from '../types';

function buildMessage(type: string, data: any): string {
  switch (type) {
    case 'task_created': return `New task created: "${data?.data?.title ?? 'Untitled'}"`;
    case 'task_updated': return `Task updated: "${data?.data?.title ?? 'Untitled'}"`;
    case 'task_deleted': return 'A task was deleted';
    case 'member_invited': return 'A new member joined the workspace';
    case 'member_removed': return 'A member was removed from the workspace';
    default: return 'New notification';
  }
}

function matchesFilters(task: Task, filters: Record<string, string>): boolean {
  if (filters.status && task.status !== filters.status) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  return true;
}

export function useSocket(currentFilters: Record<string, string> = {}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on('connect', () => {
      console.log('Socket connected');
      // refetch on reconnect to catch any missed updates
      dispatch(baseApi.util.invalidateTags(['Task', 'Workspace']));
    });

    socket.on('notification', (payload: any) => {
      const { type, data, workspaceId, taskId } = payload;
      const task = data as Task;

      // ── cache update based on type ──────────────────────────────

      if (type === 'task_created') {
        const fits = matchesFilters(task, currentFilters);

        if (fits) {
          dispatch(
            taskApi.util.updateQueryData(
              'getTasks',
              { workspaceId, ...currentFilters },
              (draft) => {
                if (draft?.data?.tasks) {
                  // avoid duplicates
                  const exists = draft.data.tasks.some(t => t._id === task._id);
                  if (!exists) draft.data.tasks.unshift(task);
                }
              }
            )
          );
        }
        // if doesn't fit filters → don't add, view stays correct
      }

      if (type === 'task_updated') {
        const fits = matchesFilters(task, currentFilters);

        dispatch(
          taskApi.util.updateQueryData(
            'getTasks',
            { workspaceId, ...currentFilters },
            (draft) => {
              if (!draft?.data?.tasks) return;

              const index = draft.data.tasks.findIndex(t => t._id === taskId);

              if (fits && index === -1) {
                // task now matches filter but wasn't in list → add it
                draft.data.tasks.unshift(task);
              } else if (!fits && index !== -1) {
                // task no longer matches filter → remove it
                draft.data.tasks.splice(index, 1);
              } else if (fits && index !== -1) {
                // task still matches → update in place
                draft.data.tasks[index] = task;
              }
              // fits=false and index=-1 → not in list, shouldn't be → do nothing
            }
          )
        );
      }

      if (type === 'task_deleted') {
        // always remove regardless of filters
        dispatch(
          taskApi.util.updateQueryData(
            'getTasks',
            { workspaceId, ...currentFilters },
            (draft) => {
              if (draft?.data?.tasks) {
                draft.data.tasks = draft.data.tasks.filter(
                  t => t._id !== taskId
                );
              }
            }
          )
        );
      }

      // ── notification + toast ────────────────────────────────────
      const message = buildMessage(type, payload);

      const notification: AppNotification = {
        id: crypto.randomUUID(),
        type,
        message,
        workspaceId,
        taskId,
        actorId: payload.actorId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      dispatch(addNotification(notification));

      if (type === 'task_deleted') {
        toast.error(message, { duration: 3000 });
      } else {
        toast.success(message, { duration: 3000 });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.off('notification');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      disconnectSocket();
    };
  }, [token, dispatch, JSON.stringify(currentFilters)]);
  //              ↑ re-run when filters change
}