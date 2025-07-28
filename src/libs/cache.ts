import { redis } from "./redis";

type Fetcher<T> = () => Promise<T>;

/**
 * Cek cache. Kalau ada, return. Kalau tidak, fetch, simpan ke cache, dan return.
 * @param key cache key
 * @param ttl time to live in seconds
 * @param fetcher function untuk ambil data fresh dari DB
 */

export async function getOrSetCache<T>(key: string, ttl: number, fetcher: Fetcher<T>) : Promise<T> {
    const cached = await redis.get(key);
    if(cached) {
        return JSON.parse(cached);
    }

    const data = await fetcher();
    await redis.set(key, JSON.stringify(data), "EX", ttl);
    return data;
}