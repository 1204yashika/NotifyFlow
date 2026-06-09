import type { Job } from 'bullmq';
import type { EmailJobData } from '../email.queue.js';
import { transporter } from '../../config/mailer.js';
import { env } from '../../config/env.js';

export async function sendTaskAssignedEmail(data: Omit<EmailJobData, 'type'>): Promise<void> {
  const { to, taskTitle, workspaceName, assignedBy } = data;

  await transporter.sendMail({
    from: `NotifyFlow <${env.EMAIL_FROM}>`,
    replyTo: env.EMAIL_FROM,
    to,
    subject: `You've been assigned a task: ${taskTitle}`,
    text: `Hi,\n\n${assignedBy} assigned you a task in ${workspaceName}.\n\nTask: ${taskTitle}\n\nLog in to NotifyFlow to view it.\n\n— The NotifyFlow Team`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr><td style="background:#6d28d9;padding:24px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">NotifyFlow</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">New task assigned to you</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">Task</p>
              <p style="margin:0;color:#111827;font-size:16px;font-weight:600;">${taskTitle}</p>
            </td></tr>
            <tr><td style="padding:0 20px 16px;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Workspace: <strong style="color:#111827;">${workspaceName}</strong></p>
              <p style="margin:0;color:#6b7280;font-size:13px;">Assigned by: <strong style="color:#111827;">${assignedBy}</strong></p>
            </td></tr>
          </table>
          <p style="margin:0;color:#6b7280;font-size:13px;">Log in to NotifyFlow to view and manage your task.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">You received this email because a task was assigned to you in NotifyFlow. If this wasn't you, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendTaskAssigned(job: Job<EmailJobData>): Promise<void> {
  await sendTaskAssignedEmail(job.data);
}