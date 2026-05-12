import redis from '../config/redis.js';

async function get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
}

async function set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function del(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
        await redis.del(...key);
    } else {
        await redis.del(key);
    }
}

export const CacheKeys = {
    workspace:     (id: string)     => `workspace:${id}`,
    userWorkspaces:(userId: string) => `workspace:user:${userId}`,
    task:          (id: string)     => `task:${id}`,
};

export const cache = { get, set, del };
