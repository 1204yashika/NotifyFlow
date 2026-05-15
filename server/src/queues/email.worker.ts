import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
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
    logger.info({ jobId: job.id }, 'Email job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Email job failed');
  });
}