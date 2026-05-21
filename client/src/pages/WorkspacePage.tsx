import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetWorkspaceQuery } from '../features/workspace/workspaceApi';
import { useGetTasksQuery } from '../features/task/taskApi';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectCurrentUser } from '../features/auth/authSlice';
import TaskBoard from '../features/task/components/TaskBoard';
import TaskList from '../features/task/components/TaskList';
import TaskModal from '../features/task/components/TaskModal';
import TaskFilters from '../features/task/components/TaskFilters';
import MemberList from '../features/workspace/components/MemberList';
import InviteMemberModal from '../features/workspace/components/InviteMemberModal';
import Button from '../components/ui/Button';
import type { Task } from '../types';

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const user = useAppSelector(selectCurrentUser);

  const [view, setView]               = useState<'kanban' | 'list'>('kanban');
  const [filters, setFilters]         = useState({});
  const [cursor, setCursor]           = useState<string | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [activeTab, setActiveTab]     = useState<'tasks' | 'members'>('tasks');

  const { data: wsData, isLoading: wsLoading } = useGetWorkspaceQuery(workspaceId!);
  const { data: taskData, isLoading: tasksLoading } = useGetTasksQuery({
    workspaceId: workspaceId!,
    ...filters,
    cursor,
  });

  const workspace = wsData?.data;
  const tasks = taskData?.data?.tasks ?? [];
  const nextCursor = taskData?.data?.nextCursor ?? null;
  const isOwner = workspace?.owner === user?._id;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  if (wsLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!workspace) return <div className="p-6 text-sm text-red-500">Workspace not found.</div>;

  return (
  <div className="p-6 w-full">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Workspace</p>
        <h1 className="text-2xl font-semibold text-gray-900">{workspace.name}</h1>
        {workspace.description && (
          <p className="text-sm text-gray-500 mt-1">{workspace.description}</p>
        )}
      </div>
      <div className="flex gap-2">
        {isOwner && (
          <Button variant="outline" onClick={() => setInviteOpen(true)}>
            + Invite
          </Button>
        )}
        <Button onClick={handleNewTask}>+ New task</Button>
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {(['tasks', 'members'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors
            ${activeTab === tab
              ? 'border-[#534AB7] text-[#534AB7]'
              : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {tab}
          {tab === 'tasks' && (
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full
              ${activeTab === 'tasks'
                ? 'bg-[#EEEDFE] text-[#534AB7]'
                : 'bg-gray-100 text-gray-400'}`}>
              {tasks.length}
            </span>
          )}
          {tab === 'members' && (
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full
              ${activeTab === 'members'
                ? 'bg-[#EEEDFE] text-[#534AB7]'
                : 'bg-gray-100 text-gray-400'}`}>
              {workspace.members.length}
            </span>
          )}
        </button>
      ))}
    </div>

    {/* Tasks tab */}
    {activeTab === 'tasks' && (
      <>
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          view={view}
          onViewChange={setView}
        />
        {view === 'kanban' ? (
          <TaskBoard
            tasks={tasks}
            workspaceId={workspaceId!}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onTaskClick={handleTaskClick}
            nextCursor={nextCursor}
            onLoadMore={() => setCursor(nextCursor ?? undefined)}
            isLoading={tasksLoading}
          />
        )}
      </>
    )}

    {/* Members tab */}
    {activeTab === 'members' && (
      <MemberList workspace={workspace} currentUserId={user?._id ?? ''} />
    )}

    {/* Modals */}
    <TaskModal
      isOpen={taskModalOpen}
      onClose={() => { setTaskModalOpen(false); setSelectedTask(null); }}
      workspaceId={workspaceId!}
      workspace={workspace}
      task={selectedTask}
    />
    <InviteMemberModal
      isOpen={inviteOpen}
      onClose={() => setInviteOpen(false)}
      workspaceId={workspaceId!}
    />
  </div>
);
}