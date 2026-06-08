import redis from '../config/redis.js';

async function get<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch {
        return null;
    }
}

async function set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
        // Redis unavailable — cache miss is acceptable
    }
}

async function del(key: string | string[]): Promise<void> {
    try {
        if (Array.isArray(key)) {
            await redis.del(...key);
        } else {
            await redis.del(key);
        }
    } catch {
        // Redis unavailable — stale cache entries will expire naturally
    }
}

export const CacheKeys = {
    workspace:     (id: string)     => `workspace:${id}`,
    userWorkspaces:(userId: string) => `workspace:user:${userId}`,
    task:          (id: string)     => `task:${id}`,
};

export const cache = { get, set, del };
