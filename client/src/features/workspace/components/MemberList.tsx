import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { useRemoveMemberMutation } from '../workspaceApi';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { selectCurrentUser } from '../../auth/authSlice';
import type { Workspace } from '../../../types';
import { getMemberName, getMemberId } from '../../../types';

interface Props {
  workspace: Workspace;
}

export default function MemberList({ workspace }: Props) {
  const user = useAppSelector(selectCurrentUser);
  const [removeMember, { isLoading }] = useRemoveMemberMutation();
  const isOwner = workspace.owner === user?._id;

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await removeMember({
        workspaceId: workspace._id,
        userId,
      }).unwrap();
    } catch {}
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Members ({workspace.members.length})
        </h3>
      </div>

      {workspace.members.map((member) => {
        const name = getMemberName(member);
        const memberId = getMemberId(member);
        const initials = name.slice(0, 2).toUpperCase();
        const isSelf = memberId === user?._id;

        return (
          <div
            key={memberId}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
          >
            <div className="w-8 h-8 rounded-full bg-[#AFA9EC] flex items-center justify-center text-xs font-medium text-[#26215C] flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
              </p>
            </div>
            <Badge role={member.role} />
            {isOwner && !isSelf && (
              <Button
                variant="ghost"
                isLoading={isLoading}
                onClick={() => handleRemove(memberId)}
                className="text-xs text-red-500 hover:bg-red-50 px-2 py-1"
              >
                Remove
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}