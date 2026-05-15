import type { Job } from 'bullmq';
import type { EmailJobData } from '../email.queue.js';
import { transporter } from '../../config/mailer.js';
import { env } from '../../config/env.js';

export async function sendTaskAssigned(job: Job<EmailJobData>): Promise<void> {
  const { to, taskTitle, workspaceName, assignedBy } = job.data;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `New task assigned: ${taskTitle}`,
    html: `
      <h2>You have been assigned a task</h2>
      <p><strong>Task:</strong> ${taskTitle}</p>
      <p><strong>Workspace:</strong> ${workspaceName}</p>
      <p><strong>Assigned by:</strong> ${assignedBy}</p>
    `,
  });
}