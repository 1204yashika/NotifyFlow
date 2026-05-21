import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '../../../types';
import TaskCard from './TaskCard';
import { useUpdateTaskMutation } from '../taskApi';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo',        label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done',        label: 'Done' },
];

interface Props {
  tasks: Task[];
  workspaceId: string;
  onTaskClick: (task: Task) => void;
}

export default function TaskBoard({ tasks, workspaceId, onTaskClick }: Props) {
  const [updateTask] = useUpdateTaskMutation();

  // local copy of tasks for optimistic UI
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // sync when server data changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = localTasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newStatus = result.destination.droppableId as TaskStatus;
    const taskId = result.draggableId;
    const task = localTasks.find((t) => t._id === taskId);

    if (!task || task.status === newStatus) return;

    // ✅ update local state IMMEDIATELY — no waiting for API
    setLocalTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      // fire API in background
      await updateTask({
        workspaceId,
        taskId,
        data: { status: newStatus },
      }).unwrap();
    } catch {
      // ❌ if API fails — revert back to original
      setLocalTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status: task.status } : t
        )
      );
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4 h-full">
        {COLUMNS.map((col) => (
          <div key={col.id} className="bg-gray-100 rounded-xl p-3 min-h-[calc(100vh-280px)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col.label}
              </h3>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                {tasksByStatus[col.id].length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-2 rounded-lg min-h-[440px] p-1 transition-colors
                    ${snapshot.isDraggingOver ? 'bg-[#EEEDFE]' : ''}`}
                >
                  {tasksByStatus[col.id].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging
                            ? 'opacity-90 rotate-1 scale-105 shadow-lg'
                            : 'transition-transform'}
                        >
                          <TaskCard task={task} onClick={onTaskClick} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {tasksByStatus[col.id].length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center py-8">No tasks</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}