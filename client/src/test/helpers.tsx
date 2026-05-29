import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { baseApi } from '../services/baseApi';
import authReducer from '../features/auth/authSlice';
import workspaceReducer from '../features/workspace/workspaceSlice';
import notificationReducer from '../features/notification/notificationSlice';

export function createTestStore(preloadedState?: Record<string, unknown>) {
  return configureStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      workspace: workspaceReducer,
      notification: notificationReducer,
    } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState,
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  store?: ReturnType<typeof createTestStore>;
  preloadedState?: Record<string, unknown>;
}

export function renderWithProviders(
  ui: ReactNode,
  {
    store,
    preloadedState,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const resolvedStore = store ?? createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={resolvedStore}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  return { store: resolvedStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// mock data — keep these
export const mockUser = {
  _id: '6a0db24b6d66e17178dbac1a',
  name: 'Yashika Test',
  email: 'yashika@test.com',
  createdAt: '2026-05-21T04:43:59.670Z',
};

export const mockWorkspace = {
  _id: '6a0e8d8f6d66e17178dbac1b',
  name: 'Test Workspace',
  description: 'A test workspace',
  owner: '6a0db24b6d66e17178dbac1a',
  members: [
    {
      userId: {
        _id: '6a0db24b6d66e17178dbac1a',
        name: 'Yashika Test',
        email: 'yashika@test.com',
      },
      role: 'owner' as const,
    },
  ],
  createdAt: '2026-05-21T04:43:59.670Z',
  updatedAt: '2026-05-21T04:43:59.670Z',
};

export const mockTask = {
  _id: '6a0ed54042bb57e324eaa9e5',
  title: 'Test Task',
  description: 'A test task description',
  status: 'todo' as const,
  priority: 'medium' as const,
  workspaceId: '6a0e8d8f6d66e17178dbac1b',
  assignedTo: null,
  createdBy: '6a0db24b6d66e17178dbac1a',
  dueDate: null,
  createdAt: '2026-05-21T04:43:59.670Z',
  updatedAt: '2026-05-21T04:43:59.670Z',
};
