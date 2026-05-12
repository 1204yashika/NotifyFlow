import { ApiError } from '../../utils/ApiError.js';
import { cache, CacheKeys } from '../../utils/cache.js';
import { findByEmail } from '../auth/auth.repository.js';
import {
  createWorkspace,
  findById,
  findUserWorkspaces,
  addMember,
  removeMember,
  findMember,
} from './workspace.repository.js';
import type { IWorkspace } from './workspace.model.js';
import type { CreateWorkspaceInput, InviteMemberInput } from './workspace.schema.js';

export async function createWorkspaceService(
  input: CreateWorkspaceInput,
  ownerId: string
): Promise<IWorkspace> {
  const workspace = await createWorkspace(input.name, input.description, ownerId);
  await cache.del(CacheKeys.userWorkspaces(ownerId));
  return workspace;
}

export async function getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
  const cacheKey = CacheKeys.userWorkspaces(userId);

  const cached = await cache.get<IWorkspace[]>(cacheKey);
  if (cached) return cached;

  const workspaces = await findUserWorkspaces(userId);
  await cache.set(cacheKey, workspaces, 300);
  return workspaces;
}

export async function inviteMember(
  workspace: IWorkspace,
  input: InviteMemberInput,
): Promise<IWorkspace> {
  const workspaceId = workspace._id.toString();

  const userToInvite = await findByEmail(input.email);
  if (!userToInvite) throw new ApiError(404, 'No user found with that email');

  const alreadyMember = await findMember(workspaceId, String(userToInvite._id));
  if (alreadyMember) throw new ApiError(409, 'User is already a member');

  const updated = await addMember(workspaceId, String(userToInvite._id), input.role);
  await cache.del(CacheKeys.workspace(workspaceId));
  return updated;
}

export async function removeMemberService(
  workspaceId: string,
  targetUserId: string,
  requestingUserId: string
): Promise<void> {
  const workspace = await findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, 'Workspace not found');
  }

  if (targetUserId === requestingUserId) {
    throw new ApiError(400, 'Owner cannot remove themselves');
  }

  await removeMember(workspaceId, targetUserId);
  await cache.del(CacheKeys.workspace(workspaceId));
}
