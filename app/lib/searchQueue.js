import Queue from 'bull';
import redis from 'ioredis';

const createRedisClient = () => {
  const client = new redis({
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

const redisClient = createRedisClient();

export const searchQueue = new Queue('search-queue', {
  redis: redisClient,
});