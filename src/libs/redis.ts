import Redis from "ioredis";

export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
})

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.log("Redis Client Error", err));