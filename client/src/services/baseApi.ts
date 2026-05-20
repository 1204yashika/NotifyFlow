import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tokenStorage } from '../utils/tokenStorage';
import { logout, setCredentials } from '../features/auth/authSlice';
import type { RootState } from '../app/store';

// base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
      ?? tokenStorage.getAccess();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// base query with automatic token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // try to refresh
    const refreshToken = tokenStorage.getRefresh();

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } =
          (refreshResult.data as any).data;

        // store new tokens
        tokenStorage.setAccess(accessToken);
        tokenStorage.setRefresh(newRefreshToken);
        api.dispatch(setCredentials({ accessToken }));

        // retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // refresh failed — logout
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Workspace', 'Task', 'Attachment', 'User'],
  endpoints: () => ({}),  // endpoints injected per feature
});