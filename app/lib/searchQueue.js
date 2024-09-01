import Queue from 'bull';

const createRedisClient = () => {
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

const redis = createRedisClient()






export const searchQueue = new Queue('search-queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls : {}
  }
});

searchQueue.process(async (job) => {
  // Implement your search logic here
  // This function should handle the actual Reddit API calls and data processing
  console.log('Processing job:', job.data);

  // Simulating some work
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Update the search status in the database
  await prisma.search.update({
    where: { id: job.data.searchId },
    data: { status: 'COMPLETED' },
  });

  return { message: 'Search completed' };
});