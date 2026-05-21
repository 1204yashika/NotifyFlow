import type { Task } from '../../../types';

const PRIORITY_STYLES = {
  high:   'bg-red-50 text-red-600',
  medium: 'bg-orange-50 text-orange-600',
  low:    'bg-green-50 text-green-600',
};

interface Props {
  task: Task;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
    >
      <p className="text-sm font-medium text-gray-900 mb-2 group-hover:text-[#534AB7] transition-colors">
        {task.title}
      </p>

      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <div className="w-5 h-5 rounded-full bg-[#AFA9EC] flex items-center justify-center text-[9px] font-medium text-[#26215C]">
              {task.assignedTo.slice(-2).toUpperCase()}
            </div>
          )}
          {task.dueDate && (
            <span className="text-xs text-gray-400">
              {new Date(task.dueDate).toLocaleDateString('en-GB')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}