import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token missing'));
  }

  const token = authHeader.split(' ')?.[1];

  if (!token) {
    return next(new ApiError(401, 'Authorization token missing'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    req.user = { userId: payload.userId };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
