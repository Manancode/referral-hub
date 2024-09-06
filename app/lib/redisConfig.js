// file: src/lib/redisConfig.js
import Redis from 'ioredis';

export const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST,                // Redis host from environment variables
    port: parseInt(process.env.REDIS_PORT || '6379'), // Redis port, default to 6379 if not provided
    password: process.env.REDIS_PASSWORD,        // Redis password from environment variables
    tls: {},                                     // Enable TLS (required by Aiven when using rediss://)
    retryStrategy: (times) => {                  // Retry strategy for reconnections
      const delay = Math.min(times * 50, 2000);  // Exponential backoff, max delay of 2 seconds
      return delay;
    },
  });

  // Handle connection errors
  client.on('error', (err) => { 
    console.error('Redis connection error:', err);
  });

  return client;
};

// Export the Redis client for use in other parts of the application
export const redis = createRedisClient();
