import { Worker } from 'bullmq';
import { env } from '../config/env.js';
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
    {
      connection: {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err.message);
  });
}