import NotificationBell from '../../features/notification/components/NotificationBell';

interface Props {
  title?: string;
}

export default function Topbar({ title }: Props) {
  return (
    <div className="h-12 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {title && <span className="text-sm font-medium text-gray-700">{title}</span>}
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
      </div>
    </div>
  );
}