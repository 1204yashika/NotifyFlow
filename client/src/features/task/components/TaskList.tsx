import type { Task } from '../../../types';
import TaskCard from './TaskCard';
import Button from '../../../components/ui/Button';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  nextCursor: string | null;
  onLoadMore: () => void;
  isLoading: boolean;
}

export default function TaskList({ tasks, onTaskClick, nextCursor, onLoadMore, isLoading }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onClick={onTaskClick} />
      ))}
      {nextCursor && (
        <Button
          variant="outline"
          onClick={onLoadMore}
          isLoading={isLoading}
          className="w-full mt-2"
        >
          Load more
        </Button>
      )}
      {tasks.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-400">
          No tasks yet. Create one to get started.
        </div>
      )}
    </div>
  );
}