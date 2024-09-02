// file: src/lib/redisConfig.js
import Redis from 'ioredis';

export const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: {},
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return client;
};

export const redis = createRedisClient();