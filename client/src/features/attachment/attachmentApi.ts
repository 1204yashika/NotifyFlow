import { baseApi } from '../../services/baseApi';
import type { ApiResponse, Attachment } from '../../types';

export const attachmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttachments: builder.query<ApiResponse<Attachment[]>, {
      workspaceId: string;
      taskId: string;
    }>({
      query: ({ workspaceId, taskId }) => ({
        url: `/workspaces/${workspaceId}/attachments`,
        params: { taskId },
      }),
      providesTags: (_result, _err, { taskId }) => [
        { type: 'Attachment', id: taskId },
      ],
    }),

    getDownloadUrl: builder.mutation<ApiResponse<{ url: string; expiresIn: number }>, {
      workspaceId: string;
      attachmentId: string;
    }>({
      query: ({ workspaceId, attachmentId }) => ({
        url: `/workspaces/${workspaceId}/attachments/${attachmentId}/url`,
        method: 'GET',
      }),
    }),

    deleteAttachment: builder.mutation<ApiResponse<null>, {
      workspaceId: string;
      attachmentId: string;
      taskId: string;
    }>({
      query: ({ workspaceId, attachmentId }) => ({
        url: `/workspaces/${workspaceId}/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { taskId }) => [
        { type: 'Attachment', id: taskId },
      ],
    }),
  }),
});

export const {
  useGetAttachmentsQuery,
  useGetDownloadUrlMutation,
  useDeleteAttachmentMutation,
} = attachmentApi;