// user.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import User from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getMeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId).select('-password -refresh_token');
    if (!user) throw new ApiError(404, 'User not found');
    res.status(200).json(new ApiResponse(200, 'User fetched', user));
  } catch (err) {
    next(err);
  }
}