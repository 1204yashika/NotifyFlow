export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Member {
  userId: string | User;
  role: 'owner' | 'member' | 'viewer';
}

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: string | User;
  members: Member[];
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  workspaceId: string;
  assignedTo: string | null;
  createdBy: string;
  dueDate: string | null;
  createdAt: string;
}

export interface Attachment {
  _id: string;
  taskId: string;
  workspaceId: string;
  uploadedBy: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  tasks: T[];
  nextCursor: string | null;
}

export function getMemberName(member: Member): string {
  if (typeof member.userId === 'string') return member.userId.slice(-6);
  return member.userId.name;
}

export function getMemberId(member: Member): string {
  if (typeof member.userId === 'string') return member.userId;
  return member.userId._id;
}
