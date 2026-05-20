import { Link, useLocation } from 'react-router-dom';
import WorkspaceSwitcher from '../../features/workspace/components/WorkspaceSwitcher';
import UserMenu from './UserMenu';
import { useAppSelector } from '../../hooks/useAppSelector';
import { selectActiveWorkspaceId } from '../../features/workspace/workspaceSlice';

const NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: '⊞' },
  { label: 'My Tasks', path: '/my-tasks', icon: '✓' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
];

export default function Sidebar() {
  const location = useLocation();
  const activeWorkspaceId = useAppSelector(selectActiveWorkspaceId);

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <div className="w-7 h-7 bg-[#534AB7] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">N</span>
        </div>
        <span className="font-semibold text-sm text-gray-900">NotifyFlow</span>
      </div>

      {/* Main nav */}
      <nav className="p-3 border-b border-gray-200">
        <p className="text-xs text-gray-400 px-2 mb-2 uppercase tracking-wide">Main</p>
        {NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1
              ${location.pathname === item.path
                ? 'bg-[#EEEDFE] text-[#534AB7]'
                : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Workspaces */}
      <div className="p-3 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-400 px-2 mb-2 uppercase tracking-wide">Workspaces</p>
        <WorkspaceSwitcher />
        {activeWorkspaceId && (
          <Link
            to={`/workspace/${activeWorkspaceId}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 mt-1"
          >
            <span>+</span> Add workspace
          </Link>
        )}
      </div>

      {/* User menu */}
      <div className="p-3 border-t border-gray-200">
        <UserMenu />
      </div>
    </aside>
  );
}