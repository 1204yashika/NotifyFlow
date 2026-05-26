import { useState } from 'react';
import { useGetMyWorkspacesQuery } from '../features/workspace/workspaceApi';
import { useGetTasksQuery } from '../features/task/taskApi';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectCurrentUser } from '../features/auth/authSlice';
import TaskCard from '../features/task/components/TaskCard';
import TaskModal from '../features/task/components/TaskModal';
import type { Task } from '../types';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function MyTasksPage() {
  const user = useAppSelector(selectCurrentUser);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const { data: wsData } = useGetMyWorkspacesQuery();
  const workspaces = wsData?.data ?? [];

  const handleTaskClick = (task: Task, workspaceId: string) => {
    setSelectedTask(task);
    setSelectedWorkspaceId(workspaceId);
    setTaskModalOpen(true);
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-gray-200">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Overview
        </p>
        <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
          All tasks assigned to you across workspaces
        </p>
      </div>

      {/* Tasks per workspace */}
      {workspaces.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          You're not a member of any workspace yet.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {workspaces.map((ws) => (
            <WorkspaceTaskSection
              key={ws._id}
              workspaceId={ws._id}
              workspaceName={ws.name}
              userId={user?._id ?? ''}
              onTaskClick={(task) => handleTaskClick(task, ws._id)}
            />
          ))}
        </div>
      )}

      {/* Task edit modal */}
      {selectedTask && selectedWorkspaceId && (
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => { setTaskModalOpen(false); setSelectedTask(null); }}
          workspaceId={selectedWorkspaceId}
          workspace={workspaces.find(w => w._id === selectedWorkspaceId)!}
          task={selectedTask}
          isOwner={false}
        />
      )}
    </div>
  );
}

// ── per-workspace section ─────────────────────────────────────────
interface SectionProps {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  onTaskClick: (task: Task) => void;
}

function WorkspaceTaskSection({
  workspaceId,
  workspaceName,
  userId,
  onTaskClick,
}: SectionProps) {
  const { data, isLoading } = useGetTasksQuery({
    workspaceId,
    assignedTo: userId,
  });

  const tasks = data?.data?.tasks ?? [];

  // sort by priority
  const sorted = [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  // group by status
  const todo       = sorted.filter(t => t.status === 'todo');
  const inProgress = sorted.filter(t => t.status === 'in_progress');
  const done       = sorted.filter(t => t.status === 'done');

  if (isLoading) return (
    <div className="text-sm text-gray-400">Loading {workspaceName}...</div>
  );

  if (tasks.length === 0) return null; // hide workspaces with no assigned tasks

  return (
    <div>
      {/* workspace name */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-[#EEEDFE] flex items-center justify-center text-xs font-semibold text-[#534AB7]">
          {workspaceName[0].toUpperCase()}
        </div>
        <h2 className="text-sm font-semibold text-gray-700">{workspaceName}</h2>
        <span className="text-xs text-gray-400">{tasks.length} tasks</span>
      </div>

      {/* status groups */}
      <div className="flex flex-col gap-4 pl-8">
        {inProgress.length > 0 && (
          <TaskGroup
            label="In Progress"
            color="bg-orange-400"
            tasks={inProgress}
            onTaskClick={onTaskClick}
          />
        )}
        {todo.length > 0 && (
          <TaskGroup
            label="Todo"
            color="bg-gray-300"
            tasks={todo}
            onTaskClick={onTaskClick}
          />
        )}
        {done.length > 0 && (
          <TaskGroup
            label="Done"
            color="bg-green-400"
            tasks={done}
            onTaskClick={onTaskClick}
          />
        )}
      </div>
    </div>
  );
}

// ── task group ────────────────────────────────────────────────────
interface GroupProps {
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

function TaskGroup({ label, color, tasks, onTaskClick }: GroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-xs text-gray-400">({tasks.length})</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onClick={onTaskClick} />
        ))}
      </div>
    </div>
  );
}