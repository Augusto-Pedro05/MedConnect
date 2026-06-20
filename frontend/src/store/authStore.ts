import { create } from 'zustand';
import type { AuthResponse } from '../types';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Hydrate from localStorage
  const stored = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');
  const initialUser = stored ? JSON.parse(stored) : null;

  return {
    user: initialUser,
    isAuthenticated: !!accessToken,

    login: (data: AuthResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    },

    updateTokens: (accessToken: string, refreshToken: string) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
  };
});
