import User, { type IUser } from './user.model.js';

export async function findById(id: string): Promise<IUser | null> {
  return User.findById(id);
}