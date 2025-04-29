import { create } from 'zustand';
import Cookies from 'js-cookie';
import { logOut, getUserInfo } from './api';

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'student' | 'teacher';
  major: 'software' | 'design' | 'web';
  generation?: number;
  admission?: number;
  isGraduated?: boolean;
  isAdmin: boolean;
}

interface AuthStore {
  isLoggedIn: boolean;
  user: User | null;
  login: (accessToken: string, refreshToken: string, userData?: User) => void;
  setUser: (userData: User) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isAuthModalOpen: boolean) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  user: null,
  isAuthModalOpen: false,

  setIsAuthModalOpen: (isAuthModalOpen: boolean) => {
    set({ isAuthModalOpen });
  },

  login: (accessToken: string, refreshToken: string, userData?: User) => {
    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
    Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'Strict' });
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
      set({ isLoggedIn: true, user: userData });
    } else {
      set({ isLoggedIn: true });
    }
  },

  setUser: (userData: User) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    set({ user: userData });
  },

  logout: () => {
    Cookies.remove('accessToken');
    localStorage.removeItem('userData');
    logOut();
    set({ isLoggedIn: false, user: null });
  },

  refreshUser: async () => {
    try {
      const userResponse = await getUserInfo();
      if (userResponse.status === 200 && userResponse.data) {
        localStorage.setItem('userData', JSON.stringify(userResponse.data));
        set({ user: userResponse.data });
      }
      return;
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
  },

  initializeAuth: async () => {
    const accessToken = Cookies.get('accessToken');
    
    if (accessToken) {
      set({ isLoggedIn: true });
      
      try {
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            set({ user: userData });
          } catch {
            console.error('Failed to parse user data from localStorage');
          }
        }
        
        const userResponse = await getUserInfo();
        if (userResponse.status === 200 && userResponse.data) {
          localStorage.setItem('userData', JSON.stringify(userResponse.data));
          set({ user: userResponse.data });
        }
      } catch (error) {
        console.error('Failed to fetch user info during initialization:', error);
      }
    }
  },
}));