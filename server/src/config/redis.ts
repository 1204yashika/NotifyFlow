import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

const isTLS = env.REDIS_URL.startsWith('rediss://');

export let redisAvailable = false;

const redis = new Redis(env.REDIS_URL, {
  ...(isTLS && { tls: { rejectUnauthorized: false } }),
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 1000);
  },
});

redis.on('connect', () => {
  redisAvailable = true;
  logger.info('Redis connected');
});

redis.on('ready', () => {
  redisAvailable = true;
});

redis.on('close', () => {
  redisAvailable = false;
  logger.warn('Redis connection closed');
});

redis.on('error', (err: Error) => {
  redisAvailable = false;
  logger.error({ err }, 'Redis error — continuing without Redis');
});

export default redis;