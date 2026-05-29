import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

// start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// stop server after all tests
afterAll(() => server.close());

// mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// mock crypto
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
});

// mock window.open (used in attachment download)
Object.defineProperty(window, 'open', {
  value: vi.fn(),
});

// mock socket.io
vi.mock('../services/socket', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(() => null),
}));