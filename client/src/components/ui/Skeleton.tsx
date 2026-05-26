export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between mt-1">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function WorkspaceCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1 flex flex-col gap-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[0, 1, 2].map((col) => (
        <div key={col} className="bg-gray-100 rounded-xl p-3">
          <Skeleton className="h-4 w-20 mb-3" />
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((card) => (
              <TaskCardSkeleton key={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}