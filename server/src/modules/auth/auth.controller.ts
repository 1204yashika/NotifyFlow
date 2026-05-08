import type { Request, Response, NextFunction } from 'express';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import { login, logout, register, refreshTokens } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tokens = await register(req.body as RegisterInput);
    res.status(201).json(new ApiResponse(201, 'User registered successfully', tokens));
  } catch (err) {
    next(err);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tokens = await login(req.body as LoginInput);
    res.status(200).json(new ApiResponse(200, 'User logged in successfully', tokens));
  } catch (err) {
    next(err);
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const tokens = await refreshTokens(refreshToken);
    res.status(200).json(new ApiResponse(200, 'Tokens refreshed successfully', tokens));
  } catch (err) {
    next(err);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    await logout(req.user.userId);
    res.status(200).json(new ApiResponse(200, 'Logged out successfully', null));
  } catch (err) {
    next(err);
  }
}
