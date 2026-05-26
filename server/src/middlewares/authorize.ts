import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { findById } from '../modules/workspace/workspace.repository.js';
import type { Role } from '../modules/workspace/workspace.model.js';

export function authorize(roles: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'Unauthorized'));
      }

      const workspaceId = req.params['workspaceId'] as string;

      if (!workspaceId) {
        return next(new ApiError(400, 'Workspace ID is required'));
      }

      const workspace = await findById(workspaceId);

      if (!workspace) {
        return next(new ApiError(404, 'Workspace not found'));
      }

      const { userId } = req.user;
      const isOwner = workspace.owner.toString() === userId;

      if (isOwner && roles.includes('owner')) {
        req.workspace = workspace;
        return next();
      }

      const member = workspace.members.find((m) => {
        const id = m.userId as any;
        const memberId = id._id?.toString() ?? id.toString();
        return memberId === userId;
      });

      if (!member || !roles.includes(member.role)) {
        return next(new ApiError(403, 'You do not have permission to perform this action'));
      }

      req.workspace = workspace;
      next();
    } catch (err) {
      next(err);
    }
  };
}
