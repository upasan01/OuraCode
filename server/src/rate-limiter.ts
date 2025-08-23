import { redis } from "./lib/redis.js";

export const isRateLimited = async (userId: string) => {
  const key = `rate:${userId}`;
  const now = Date.now();

  // record the request
  await redis.zadd(key, { score: now, member: `${now}` });

  // remove 10 SEC oldER entries 
  await redis.zremrangebyscore(key, 0, now - 10_000);

  // count recent requests within 10sec
  const count = await redis.zcard(key);

  // set expiry (optional)
  await redis.expire(key, 11);

  return count > 5;
}
