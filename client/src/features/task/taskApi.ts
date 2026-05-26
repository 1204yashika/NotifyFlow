import { baseApi } from '../../services/baseApi';
import type { ApiResponse, Task, PaginatedResponse } from '../../types';

interface GetTasksParams {
  workspaceId: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  cursor?: string;
  limit?: number;
}

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
}

interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: 'todo' | 'in_progress' | 'done';
}

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<ApiResponse<PaginatedResponse<Task>>, GetTasksParams>({
      query: ({ workspaceId, ...params }) => ({
        url: `/workspaces/${workspaceId}/tasks`,
        params,
      }),
      providesTags: (_result, _err, { workspaceId }) => [
        { type: 'Task', id: workspaceId },
      ],
    }),

    createTask: builder.mutation<ApiResponse<Task>, {
      workspaceId: string;
      data: CreateTaskInput;
    }>({
      query: ({ workspaceId, data }) => ({
        url: `/workspaces/${workspaceId}/tasks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _err, { workspaceId }) => [
        { type: 'Task', id: workspaceId },
      ],
    }),

    updateTask: builder.mutation<ApiResponse<Task>, {
      workspaceId: string;
      taskId: string;
      data: UpdateTaskInput;
    }>({
      query: ({ workspaceId, taskId, data }) => ({
        url: `/workspaces/${workspaceId}/tasks/${taskId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { workspaceId }) => [
        { type: 'Task', id: workspaceId },
      ],
    }),

    deleteTask: builder.mutation<ApiResponse<null>, {
      workspaceId: string;
      taskId: string;
    }>({
      query: ({ workspaceId, taskId }) => ({
        url: `/workspaces/${workspaceId}/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { workspaceId }) => [
        { type: 'Task', id: workspaceId },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;