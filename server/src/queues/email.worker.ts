import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import { sendTaskAssigned } from './jobs/sendTaskAssigned.js';
import type { EmailJobData } from './email.queue.js';

export function startEmailWorker(): void {
  const worker = new Worker<EmailJobData>(
    'email',
    async (job) => {
      if (job.data.type === 'task_assigned') {
        await sendTaskAssigned(job);
      }
    },
    { connection: redis }
  );

  worker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err.message);
  });
}