import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../config/logger.js';

mongoose.connection.on('disconnected', () => {
  logger.error('MongoDb disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB error');
});

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_CONNECTION_STRING);
    logger.info('MongoDB connected')
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  }
}
