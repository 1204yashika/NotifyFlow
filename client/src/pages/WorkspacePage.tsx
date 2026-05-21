import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetWorkspaceQuery } from '../features/workspace/workspaceApi';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectCurrentUser } from '../features/auth/authSlice';
import MemberList from '../features/workspace/components/MemberList';
import InviteMemberModal from '../features/workspace/components/InviteMemberModal';
import CreateWorkspaceModal from '../features/workspace/components/CreateWorkspaceModal';
import Button from '../components/ui/Button';

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const user = useAppSelector(selectCurrentUser);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError } = useGetWorkspaceQuery(workspaceId!);
  const workspace = data?.data;

  const isOwner = workspace?.owner === user?._id;

  if (isLoading) return (
    <div className="p-6 text-sm text-gray-400">Loading workspace...</div>
  );

  if (isError || !workspace) return (
    <div className="p-6 text-sm text-red-500">
      Workspace not found or you don't have access.
    </div>
  );

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-sm text-gray-500 mt-1">{workspace.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            New workspace
          </Button>
          {isOwner && (
            <Button onClick={() => setInviteOpen(true)}>
              Invite member
            </Button>
          )}
        </div>
      </div>

      {/* Members */}
      <MemberList workspace={workspace} currentUserId={user?._id ?? ''} />

      {/* Modals */}
      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        workspaceId={workspaceId!}
      />
      <CreateWorkspaceModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}