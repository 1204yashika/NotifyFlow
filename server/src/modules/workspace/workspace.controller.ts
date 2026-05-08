import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { createWorkspaceService, getUserWorkspaces, inviteMember, removeMemberService } from './workspace.service.js';

export async function createWorkspaceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const workspace = await createWorkspaceService(req.body, req.user!.userId);
    res.status(201).json(new ApiResponse(201, 'Workspace created', workspace));
  } catch (err) {
    next(err);
  }
}

export async function getWorkspaceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.status(200).json(new ApiResponse(200, 'Workspace fetched', req.workspace));
  } catch (err) {
    next(err);
  }
}

export async function getMyWorkspacesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const workspaces = await getUserWorkspaces(req.user!.userId);
    res.status(200).json(new ApiResponse(200, 'Workspaces fetched', workspaces));
  } catch (err) {
    next(err);
  }
}
export async function inviteMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const workspace = await inviteMember(req.workspace!, req.body);
    res.status(200).json(new ApiResponse(200, 'Member invited', workspace));
  } catch (err) {
    next(err);
  }
}

export async function removeMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await removeMemberService(req.workspace!._id.toString(), req.params['userId'] as string, req.user!.userId);
    res.status(200).json(new ApiResponse(200, 'Member removed', null));
  } catch (err) {
    next(err);
  }
}
