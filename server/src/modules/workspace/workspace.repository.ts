import { ApiError } from "../../utils/ApiError.js";
import { Workspace, type IWorkspace, type Role } from "./workspace.model.js";

export async function createWorkspace(name: string, description:string, ownerId: string): Promise<IWorkspace>{
	const workspace = await Workspace.create({
		name: name,
		description: description,
		owner: ownerId,
		members: [{ userId: ownerId, role: 'owner' }]
	})

	if(!workspace){
		throw new ApiError(500, "Workspace cannot be created");
	}
	return workspace;
}

export async function findById(id: string): Promise<IWorkspace | null>{
	return Workspace.findById(id);
}

export async function findUserWorkspaces(userId: string): Promise<IWorkspace[]> {
  return Workspace.find({
    $or: [
      { owner: userId },
      { 'members.userId': userId },
    ],
  });
}

export async function addMember(
  workspaceId: string,
  userId: string,
  role: Role
): Promise<IWorkspace> {
  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $addToSet: { members: { userId, role } } },
    { new: true }
  );

  if (!workspace) {
    throw new ApiError(404, 'Workspace not found');
  }

  return workspace;
}

export async function removeMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $pull: { members: { userId } } },
    { new: true }
  );

  if (!workspace) {
    throw new ApiError(404, 'Workspace not found');
  }
}

export async function findMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    'members.userId': userId,
  });

  return workspace !== null;
}
