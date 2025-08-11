// utils/cacheHelper.ts

import { redis } from "./redis";

/**
 * Menghapus cache berdasarkan prefix key.
 * Contoh:
 *   await invalidateCacheByPrefix("bookings");
 *   await invalidateCacheByPrefix("users");
 */
export const invalidateCacheByPrefix = async (prefix: string) => {
  try {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Gagal menghapus cache dengan prefix ${prefix}:`, error);
  }
};
