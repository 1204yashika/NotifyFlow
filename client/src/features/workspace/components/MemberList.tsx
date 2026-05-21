import Badge from '../../../components/ui/Badge';
import type { Workspace } from '../../../types';

interface Props {
  workspace: Workspace;
  currentUserId: string;
}

export default function MemberList({ workspace, currentUserId }: Props) {
  const isOwner = workspace.owner === currentUserId;

  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">
          Members ({workspace.members.length})
        </h3>
      </div>
      {workspace.members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#AFA9EC] flex items-center justify-center text-xs font-medium text-[#26215C]">
            {member.userId.slice(-2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">{member.userId}</p>
          </div>
          <Badge role={member.role} />
        </div>
      ))}
    </div>
  );
}