import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface WorkspaceState {
  activeWorkspaceId: string | null;
}

const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);

const initialState: WorkspaceState = {
  activeWorkspaceId: ls()?.getItem('activeWorkspaceId') ?? null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action: PayloadAction<string>) => {
      state.activeWorkspaceId = action.payload;
      ls()?.setItem('activeWorkspaceId', action.payload);
    },
    clearActiveWorkspace: (state) => {
      state.activeWorkspaceId = null;
      ls()?.removeItem('activeWorkspaceId');
    },
  },
});

export const { setActiveWorkspace, clearActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
export const selectActiveWorkspaceId = (state: RootState) => state.workspace.activeWorkspaceId;