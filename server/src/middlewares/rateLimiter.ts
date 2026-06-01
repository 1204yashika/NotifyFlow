import type { Request, Response, NextFunction } from 'express';
import redis, { redisAvailable } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';

export function rateLimiter(maxRequests: number, windowSeconds: number) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (process.env.NODE_ENV === 'development' || !redisAvailable) return next();
        try {
            const identifier = req.ip ?? 'unknown';
            const key = `rate:${identifier}`;

            const pipeline = redis.pipeline();
            pipeline.incr(key);
            pipeline.expire(key, windowSeconds, 'NX');
            const results = await pipeline.exec();
            const count = (results?.[0]?.[1] as number) ?? 0;

            const ttl = await redis.ttl(key);
            const resetTimestamp = Math.floor(Date.now() / 1000) + ttl;

            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
            res.setHeader('X-RateLimit-Reset', resetTimestamp);

            if (count > maxRequests) {
                throw new ApiError(429, 'Too many requests, please try again later');
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}
