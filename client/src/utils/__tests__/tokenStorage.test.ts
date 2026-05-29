import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenStorage } from '../tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    // clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getAccess', () => {
    it('returns null when no token stored', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(tokenStorage.getAccess()).toBeNull();
    });

    it('returns token when stored', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('test-access-token');
      expect(tokenStorage.getAccess()).toBe('test-access-token');
    });
  });

  describe('setAccess', () => {
    it('stores access token in localStorage', () => {
      tokenStorage.setAccess('my-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'my-token'
      );
    });

    it('does not store if token is empty', () => {
      tokenStorage.setAccess('');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('setRefresh', () => {
    it('stores refresh token', () => {
      tokenStorage.setRefresh('my-refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'my-refresh-token'
      );
    });

    it('does not store undefined', () => {
      tokenStorage.setRefresh(undefined as any);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('clearTokens', () => {
    it('removes both tokens', () => {
      tokenStorage.clearTokens();
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
    });
  });
});