import { useGetMyWorkspacesQuery } from '../features/workspace/workspaceApi';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectCurrentUser } from '../features/auth/authSlice';

export default function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const { data } = useGetMyWorkspacesQuery();
  const workspaces = data?.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Workspaces</p>
          <p className="text-2xl font-semibold text-gray-900">{workspaces.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Member of</p>
          <p className="text-2xl font-semibold text-gray-900">{workspaces.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Role</p>
          <p className="text-2xl font-semibold text-gray-900">Owner</p>
        </div>
      </div>

      {/* Workspace list */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900">Your workspaces</h2>
        </div>
        {workspaces.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No workspaces yet. Create one to get started.
          </div>
        ) : (
          workspaces.map((ws) => (
            <div key={ws._id} className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-0">
              <div className="w-8 h-8 bg-[#EEEDFE] rounded-lg flex items-center justify-center text-[#534AB7] font-semibold text-sm">
                {ws.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{ws.name}</p>
                <p className="text-xs text-gray-400">{ws.members?.length ?? 0} members</p>
              </div>
              <a
                href={`/workspace/${ws._id}`}
                className="text-xs text-[#534AB7] hover:underline"
              >
                Open →
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}