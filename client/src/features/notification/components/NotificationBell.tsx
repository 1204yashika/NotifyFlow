import { useState } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import {
  selectNotifications,
  selectUnreadCount,
  markAllRead,
} from '../notificationSlice';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      dispatch(markAllRead());
    }
  };

  const TYPE_ICON: Record<string, string> = {
    task_created:   '✅',
    task_updated:   '✏️',
    task_deleted:   '🗑️',
    member_invited: '👋',
    member_removed: '👤',
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* dropdown */}
          <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-xs text-[#534AB7] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 
                      ${!n.read ? 'bg-[#FAFAFE]' : ''}`}
                  >
                    <span className="text-base mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[#534AB7] mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}