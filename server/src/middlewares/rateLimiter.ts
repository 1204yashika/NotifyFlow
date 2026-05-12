import type { Request, Response, NextFunction } from 'express';
import redis from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';

export function rateLimiter(maxRequests: number, windowSeconds: number) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const identifier = req.ip ?? 'unknown';
            const key = `rate:${identifier}`;

            const count = await redis.incr(key);

            if (count === 1) {
                await redis.expire(key, windowSeconds);
            }

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
