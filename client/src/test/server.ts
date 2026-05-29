import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { mockUser, mockWorkspace, mockTask } from './helpers';

const BASE = 'http://localhost/api/v1';

// define all API handlers
export const handlers = [

  // ── Auth ──────────────────────────────────────────
  http.post(`${BASE}/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      message: 'User registered successfully',
      statusCode: 201,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    }, { status: 201 });
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // small delay so isLoading:true is observable in tests
    await new Promise((r) => setTimeout(r, 50));

    if (body.password === 'wrongpassword') {
      return HttpResponse.json({
        success: false,
        message: 'Invalid email or password',
        statusCode: 401,
      }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      message: 'User logged in successfully',
      statusCode: 200,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
      statusCode: 200,
      data: null,
    });
  }),

  // ── Users ─────────────────────────────────────────
  http.get(`${BASE}/users/me`, () => {
    return HttpResponse.json({
      success: true,
      message: 'User fetched',
      statusCode: 200,
      data: mockUser,
    });
  }),

  // ── Workspaces ────────────────────────────────────
  http.get(`${BASE}/workspaces`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Workspaces fetched',
      statusCode: 200,
      data: [mockWorkspace],
    });
  }),

  http.post(`${BASE}/workspaces`, async ({ request }) => {
    const body = await request.json() as { name: string; description: string };
    return HttpResponse.json({
      success: true,
      message: 'Workspace created',
      statusCode: 201,
      data: {
        ...mockWorkspace,
        name: body.name,
        description: body.description,
      },
    }, { status: 201 });
  }),

  http.get(`${BASE}/workspaces/:workspaceId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Workspace fetched',
      statusCode: 200,
      data: mockWorkspace,
    });
  }),

  // ── Tasks ─────────────────────────────────────────
  http.get(`${BASE}/workspaces/:workspaceId/tasks`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Tasks fetched',
      statusCode: 200,
      data: {
        tasks: [mockTask],
        nextCursor: null,
      },
    });
  }),

  http.post(`${BASE}/workspaces/:workspaceId/tasks`, async ({ request }) => {
    const body = await request.json() as { title: string; description: string };
    return HttpResponse.json({
      success: true,
      message: 'Task created',
      statusCode: 201,
      data: {
        ...mockTask,
        title: body.title,
        description: body.description,
      },
    }, { status: 201 });
  }),
];

// create server
export const server = setupServer(...handlers);
