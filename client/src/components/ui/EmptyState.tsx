interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = '📭', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-4xl mb-3">{icon}</p>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-400 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-[#534AB7] text-white text-sm rounded-lg hover:bg-[#4338a0] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}