import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_CONNECTION_STRING);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}
