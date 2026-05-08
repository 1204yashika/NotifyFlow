import User, { type IUser } from '../user/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import type { RegisterInput } from './auth.schema.js';

export async function findByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email });
}

export async function findById(id: string): Promise<IUser | null> {
  return User.findById(id);
}

export async function createUser(data: RegisterInput & { password: string }): Promise<IUser> {
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  if (!user) {
    throw new ApiError(500, 'User could not be created');
  }

  return user;
}

export async function updateRefreshToken(userId: string, token: string | null): Promise<void> {
  if (!userId) throw new ApiError(400, 'Id is required');

  const user = await User.findByIdAndUpdate(
    userId,
    { refresh_token: token },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }
}