import { baseApi } from '../../services/baseApi';
import type { ApiResponse, User } from '../../types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
  }),
});

export const { useGetMeQuery } = userApi;