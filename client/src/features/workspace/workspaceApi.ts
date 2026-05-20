import { baseApi } from '../../services/baseApi';
import type { ApiResponse, Workspace } from '../../types';

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyWorkspaces: builder.query<ApiResponse<Workspace[]>, void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),

    createWorkspace: builder.mutation<ApiResponse<Workspace>, {
      name: string;
      description?: string;
    }>({
      query: (body) => ({
        url: '/workspaces',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Workspace'],
    }),

    getWorkspace: builder.query<ApiResponse<Workspace>, string>({
      query: (id) => `/workspaces/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Workspace', id }],
    }),

    inviteMember: builder.mutation<ApiResponse<Workspace>, {
      workspaceId: string;
      email: string;
      role: 'member' | 'viewer';
    }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { workspaceId }) => [
        { type: 'Workspace', id: workspaceId }
      ],
    }),
  }),
});

export const {
  useGetMyWorkspacesQuery,
  useCreateWorkspaceMutation,
  useGetWorkspaceQuery,
  useInviteMemberMutation,
} = workspaceApi;