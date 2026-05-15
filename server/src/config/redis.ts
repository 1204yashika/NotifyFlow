import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../config/logger.js';

const redis = new Redis(env.REDIS_URL);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err: Error) => logger.error({err}, 'Redis error'));

export default redis;