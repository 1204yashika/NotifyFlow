import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  selectNotifications,
  selectUnreadCount,
  markAllRead,
  clearNotifications,
} from '../features/notification/notificationSlice';
import Button from '../components/ui/Button';

const TYPE_META: Record<string, { icon: string; label: string; dot: string; bg: string; iconBg: string }> = {
  task_created:   { icon: '✅', label: 'Task created',   dot: 'bg-green-400',  bg: 'bg-white',  iconBg: 'bg-green-50' },
  task_updated:   { icon: '✏️', label: 'Task updated',   dot: 'bg-blue-400',   bg: 'bg-white',  iconBg: 'bg-blue-50'  },
  task_deleted:   { icon: '🗑️', label: 'Task deleted',   dot: 'bg-red-400',    bg: 'bg-white',  iconBg: 'bg-red-50'   },
  member_invited: { icon: '👋', label: 'Member invited', dot: 'bg-purple-400', bg: 'bg-white',  iconBg: 'bg-purple-50'},
  member_removed: { icon: '👤', label: 'Member removed', dot: 'bg-gray-400',   bg: 'bg-white',  iconBg: 'bg-gray-50'  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Activity</p>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-400 mt-1">
            {unreadCount > 0 ? (
              <span className="text-[#534AB7] font-medium">{unreadCount} unread</span>
            ) : 'All caught up'}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => dispatch(markAllRead())}>
              Mark all read
            </Button>
            <Button
              variant="ghost"
              onClick={() => dispatch(clearNotifications())}
              className="text-red-500 hover:bg-red-50"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EEEDFE] flex items-center justify-center text-2xl mb-4">
            🔔
          </div>
          <p className="text-base font-medium text-gray-700 mb-1">No notifications yet</p>
          <p className="text-sm text-gray-400">
            Activity from your workspaces will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? { icon: '🔔', label: 'Notification', dot: 'bg-gray-400', bg: 'bg-white', iconBg: 'bg-gray-50' };
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all
                  ${n.read
                    ? 'bg-white border-gray-100'
                    : 'bg-[#FAFAFE] border-[#534AB7]/20 shadow-sm'}`}
              >
                {/* icon */}
                <div className={`w-9 h-9 rounded-lg ${meta.iconBg} flex items-center justify-center text-base flex-shrink-0`}>
                  {meta.icon}
                </div>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {meta.label}
                    </span>
                    {!n.read && (
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    )}
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-snug">
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* unread indicator */}
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-[#534AB7] mt-1.5 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
