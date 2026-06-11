import { create } from 'zustand';
import api from '@/lib/api';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  setAuth: (user) => {
    if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    if (typeof window !== 'undefined') localStorage.removeItem('user');
    set({ user: null });
  },
}));
