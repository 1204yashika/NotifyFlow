import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, {
  setCredentials,
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAccessToken,
} from '../../features/auth/authSlice';
import { mockUser } from '../../test/helpers';

// mock tokenStorage
vi.mock('../../../utils/tokenStorage', () => ({
  tokenStorage: {
    getAccess: vi.fn(() => null),
    setAccess: vi.fn(),
    setRefresh: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

describe('authSlice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
  };

  describe('initial state', () => {
    it('has correct initial state', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setCredentials', () => {
    it('sets access token and marks authenticated', () => {
      const state = authReducer(
        initialState,
        setCredentials({ accessToken: 'new-token' })
      );
      expect(state.accessToken).toBe('new-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('sets user when provided', () => {
      const state = authReducer(
        initialState,
        setCredentials({ accessToken: 'token', user: mockUser })
      );
      expect(state.user).toEqual(mockUser);
      expect(state.user?.name).toBe('Yashika Test');
    });

    it('does not overwrite user if not provided', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        accessToken: 'old-token',
        isAuthenticated: true,
      };
      const state = authReducer(
        stateWithUser,
        setCredentials({ accessToken: 'new-token' })
      );
      expect(state.user).toEqual(mockUser); // user preserved
      expect(state.accessToken).toBe('new-token');
    });
  });

  describe('logout', () => {
    it('clears all auth state', () => {
      const loggedInState = {
        user: mockUser,
        accessToken: 'some-token',
        isAuthenticated: true,
      };
      const state = authReducer(loggedInState, logout());
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('selectors', () => {
    const rootState = {
      auth: {
        user: mockUser,
        accessToken: 'test-token',
        isAuthenticated: true,
      },
    } as any;

    it('selectCurrentUser returns user', () => {
      expect(selectCurrentUser(rootState)).toEqual(mockUser);
    });

    it('selectIsAuthenticated returns true', () => {
      expect(selectIsAuthenticated(rootState)).toBe(true);
    });

    it('selectAccessToken returns token', () => {
      expect(selectAccessToken(rootState)).toBe('test-token');
    });

    it('selectCurrentUser returns null when logged out', () => {
      const loggedOutState = {
        auth: { user: null, accessToken: null, isAuthenticated: false }
      } as any;
      expect(selectCurrentUser(loggedOutState)).toBeNull();
    });
  });
});