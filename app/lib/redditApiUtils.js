
import { redis } from './redisConfig';
import { REDDIT_RATE_LIMIT } from './constants';

export async function redditApiRequest(fn, ...args) {
  console.log(`Calling Reddit API: ${fn.name} with args: ${JSON.stringify(args)}`);
  const key = `ratelimit:reddit:${fn.name}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, REDDIT_RATE_LIMIT.period / 1000);
  }
  if (current > REDDIT_RATE_LIMIT.requests) {
    const ttl = await redis.ttl(key);
    console.log(`Rate limit exceeded for ${fn.name}. Current: ${current}, TTL: ${ttl}`);
    throw new Error(`Rate limit exceeded. Please try again in ${ttl} seconds.`);
  }
  console.log(`Reddit API call ${fn.name} completed successfully`);
  return fn(...args);
}

// You can add more Reddit API-related utility functions here