import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '../../utils/tokenStorage';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccess(), // hydrate from localStorage on load
  isAuthenticated: !!tokenStorage.getAccess(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user?: User }>) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      if (action.payload.user) state.user = action.payload.user;
      tokenStorage.setAccess(action.payload.accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      tokenStorage.clearTokens();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;