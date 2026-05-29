import { describe, it, expect, vi, beforeEach } from 'vitest';
import workspaceReducer, {
  setActiveWorkspace,
  clearActiveWorkspace,
  selectActiveWorkspaceId,
} from '../../features/workspace/workspaceSlice';

vi.mock('../../../utils/tokenStorage');

describe('workspaceSlice', () => {
  const initialState = {
    activeWorkspaceId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('setActiveWorkspace', () => {
    it('sets active workspace ID', () => {
      const state = workspaceReducer(
        initialState,
        setActiveWorkspace('workspace-123')
      );
      expect(state.activeWorkspaceId).toBe('workspace-123');
    });

    it('persists to localStorage', () => {
      workspaceReducer(
        initialState,
        setActiveWorkspace('workspace-123')
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'activeWorkspaceId',
        'workspace-123'
      );
    });

    it('overwrites previous workspace', () => {
      const stateWithWorkspace = {
        activeWorkspaceId: 'old-workspace',
      };
      const state = workspaceReducer(
        stateWithWorkspace,
        setActiveWorkspace('new-workspace')
      );
      expect(state.activeWorkspaceId).toBe('new-workspace');
    });
  });

  describe('clearActiveWorkspace', () => {
    it('clears active workspace', () => {
      const stateWithWorkspace = {
        activeWorkspaceId: 'workspace-123',
      };
      const state = workspaceReducer(
        stateWithWorkspace,
        clearActiveWorkspace()
      );
      expect(state.activeWorkspaceId).toBeNull();
    });

    it('removes from localStorage', () => {
      workspaceReducer(
        { activeWorkspaceId: 'workspace-123' },
        clearActiveWorkspace()
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        'activeWorkspaceId'
      );
    });
  });

  describe('selectActiveWorkspaceId', () => {
    it('returns active workspace id', () => {
      const rootState = {
        workspace: { activeWorkspaceId: 'workspace-123' }
      } as any;
      expect(selectActiveWorkspaceId(rootState)).toBe('workspace-123');
    });

    it('returns null when no workspace selected', () => {
      const rootState = {
        workspace: { activeWorkspaceId: null }
      } as any;
      expect(selectActiveWorkspaceId(rootState)).toBeNull();
    });
  });
});