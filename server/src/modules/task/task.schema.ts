import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).default(''),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assignedTo: z.string().optional(),   // userId
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

// cursor-based pagination query params
export const getTasksSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),       // last task's createdAt timestamp
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().optional(),
});


export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTasksInput = z.infer<typeof getTasksSchema>;