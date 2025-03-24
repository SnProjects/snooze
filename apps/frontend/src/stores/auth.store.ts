import { create } from 'zustand';
import { User } from '@snooze/shared-types';
import { getProfile, refresh, logout } from '../services/auth.service';
import { socketService } from '../services/socket';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  initializeAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
  loading: true,
  setTokens: async (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken, loading: true });
    try {
      const user = await getProfile(accessToken);
      socketService.connect(accessToken);
      set({ user, loading: false });
    } catch {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        loading: false,
      });
    }
  },
  logout: async () => {
    const accessToken = get().accessToken;
    if (accessToken) {
      await logout(accessToken);
    }
    socketService.disconnect();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ accessToken: null, refreshToken: null, user: null });
  },
  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        loading: false,
      });
      return false;
    }
    try {
      const { access_token, refresh_token } = await refresh(refreshToken);
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      socketService.disconnect();
      const user = await getProfile(access_token);
      socketService.connect(access_token);
      set({
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
        loading: false,
      });
      return true; // Indicate success
    } catch {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        loading: false,
      });
      return false; // Indicate failure
    }
  },
  initializeAuth: async () => {
    const accessToken = get().accessToken;
    if (!accessToken) {
      set({ loading: false });
      return false;
    }
    try {
      const user = await getProfile(accessToken);
      socketService.connect(accessToken);
      set({ user, loading: false });
      return true;
    } catch {
      try {
        const success = await get().refreshAccessToken();
        return success;
      } catch {
        await get().logout();
        set({ loading: false });
        return false;
      }
    }
  },
}));
