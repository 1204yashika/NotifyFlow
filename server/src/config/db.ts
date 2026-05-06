import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGO_CONNECTION_STRING);
  console.log('MongoDB connected');
}
