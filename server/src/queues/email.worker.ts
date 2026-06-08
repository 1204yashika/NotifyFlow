import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { sendTaskAssigned } from './jobs/sendTaskAssigned.js';
import type { EmailJobData } from './email.queue.js';

export function startEmailWorker(): void {
  let worker: Worker<EmailJobData>;

  try {
    worker = new Worker<EmailJobData>(
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
          enableOfflineQueue: false,
        },
      }
    );
  } catch (err) {
    logger.warn({ err }, 'Email worker could not start — Redis unavailable');
    return;
  }

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Email job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Email job failed');
  });

  worker.on('error', (err) => {
    if (err.message?.includes('max requests limit exceeded')) {
      logger.error({ err }, 'Redis request limit hit — stopping email worker to prevent further quota burn');
      worker.close().catch(() => {});
      return;
    }
    logger.warn({ err }, 'Email worker error — continuing without email queue');
  });
}