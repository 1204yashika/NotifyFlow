import { Queue } from 'bullmq';
import redis from '../config/redis.js';

export type EmailJobData = {
  type: 'task_assigned';
  to: string;           // recipient email
  taskTitle: string;
  workspaceName: string;
  assignedBy: string;   // name of person who assigned
};

export const emailQueue = new Queue<EmailJobData>('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,                          // retry 3 times on failure
    backoff: { type: 'exponential', delay: 2000 }, // wait 2s, 4s, 8s
    removeOnComplete: 100,                // keep last 100 completed jobs
    removeOnFail: 500,                    // keep last 500 failed jobs
  },
});