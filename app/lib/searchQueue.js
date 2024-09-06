import Queue from 'bull';

// Directly passing Redis connection options instead of creating an ioredis client
export const searchQueue = new Queue('search-queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: {}, // Use TLS as Aiven requires it
  },
  limiter: {
    max: 10,
    duration: 1000, // Allow a max of 10 jobs per second
  },
  defaultJobOptions: {
    attempts: 3, // Retry the job 3 times on failure
    backoff: {
      type: 'exponential', // Exponential backoff between retries
      delay: 2000, // Initial delay of 2 seconds
    },
    timeout: 300000, // 5-minute job timeout
  }
});
