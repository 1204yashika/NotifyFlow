import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../../config/env.js';
import { createUser, findByEmail, findById, updateRefreshToken } from './auth.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function generateTokens(userId: string): AuthTokens {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
  });

  return { accessToken, refreshToken };
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const user = await findByEmail(input.email)
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(input.password, user.password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  try {
    const tokens = generateTokens(String(user._id));
    await updateRefreshToken(String(user._id), tokens.refreshToken);
    return tokens;
  } catch {
    throw new ApiError(500, 'Failed to generate tokens');
  }
}

export async function register(input: RegisterInput): Promise<AuthTokens> {
  const existingUser = await findByEmail(input.email);

  if (existingUser) {
    throw new ApiError(409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await createUser({ ...input, password: hashedPassword });

  try {
    const tokens = generateTokens(String(user._id));
	await updateRefreshToken(String(user._id), tokens.refreshToken);
    return tokens;
  } catch {
    throw new ApiError(500, 'Failed to generate tokens');
  }
}


export async function logout(userId: string): Promise<void> {
  await updateRefreshToken(userId, null);
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  let payload: { userId: string };

  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await findById(payload.userId);
  if (!user) throw new ApiError(401, 'Invalid or expired refresh token');

  if (user.refresh_token !== refreshToken) {
    throw new ApiError(401, 'Refresh token mismatch');
  }

  try {
    const tokens = generateTokens(payload.userId);
    await updateRefreshToken(payload.userId, tokens.refreshToken);
    return tokens;
  } catch {
    throw new ApiError(500, 'Failed to generate tokens');
  }
}