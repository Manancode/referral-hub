import { searchQueue } from './searchQueue.js'
import { processSearch } from './searchProcessor.js'

function startWorker() {
  searchQueue.process(async (job) => {
    console.log('Processing job:', job.id);
    try {
      await processSearch(job);
      console.log('Job completed:', job.id);
    } catch (error) {
      console.error('Error processing job:', job.id, error);
      throw error;
    }
  });

  console.log('Worker started and listening for jobs');
}

startWorker();