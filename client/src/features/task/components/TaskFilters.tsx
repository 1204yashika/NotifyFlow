interface Filters {
  status?: string;
  priority?: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  view: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
}

export default function TaskFilters({ filters, onChange, view, onViewChange }: Props) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <select
        value={filters.status ?? ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#534AB7]"
      >
        <option value="">All statuses</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={filters.priority ?? ''}
        onChange={(e) => onChange({ ...filters, priority: e.target.value || undefined })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#534AB7]"
      >
        <option value="">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <div className="ml-auto flex border border-gray-200 rounded-lg overflow-hidden">
        {(['kanban', 'list'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1.5 text-sm capitalize
              ${view === v
                ? 'bg-[#534AB7] text-white'
                : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}