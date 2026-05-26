import { baseApi } from '../../services/baseApi';
import type { ApiResponse } from '../../types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthTokens>, {
      name: string;
      email: string;
      password: string;
    }>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<ApiResponse<AuthTokens>, {
      email: string;
      password: string;
    }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;