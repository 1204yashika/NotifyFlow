import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).default(''),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'viewer']),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
