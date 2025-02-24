import { create } from 'zustand';
import Cookies from 'js-cookie';
import { logOut } from './api';

interface AuthStore {
  isLoggedIn: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
  initializeAuth: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isAuthModalOpen: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  isAuthModalOpen: false,

  setIsAuthModalOpen: (isAuthModalOpen: boolean) => {
    set({ isAuthModalOpen });
  },

  login: (accessToken: string) => {
    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
    set({ isLoggedIn: true });
  },

  logout: () => {
    Cookies.remove('accessToken');
    logOut();
    set({ isLoggedIn: false });
  },

  initializeAuth: () => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      set({ isLoggedIn: true });
    }
  },
}));