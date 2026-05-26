import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../services/baseApi';
import authReducer from '../features/auth/authSlice';
import workspaceReducer from '../features/workspace/workspaceSlice';
import notificationReducer from '../features/notification/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    notification: notificationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;