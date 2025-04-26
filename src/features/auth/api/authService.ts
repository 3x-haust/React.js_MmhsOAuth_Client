import { API_URL } from '../../../shared/api/constants';
import Cookies from 'js-cookie';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  role: string;
  major: string;
  admission: string;
  generation: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  major?: string;
  generation?: string;
  admission?: string;
  isGraduated?: boolean;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const refreshTokens = async (): Promise<string | null> => {
  const refreshToken = Cookies.get('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();
    
    if (result.status === 200 && result.data?.accessToken) {
      Cookies.set('accessToken', result.data.accessToken, { secure: true, sameSite: 'Strict' });
      return result.data.accessToken;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const executeWithTokenRefresh = async <T>(
  apiCall: (token?: string) => Promise<T>
): Promise<T> => {
  try {
    return await apiCall(Cookies.get('accessToken'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('TOKEN_EXPIRED')) {
      const newToken = await refreshTokens();
      if (newToken) {
        return apiCall(newToken);
      }
      throw new Error('Token refresh failed. Authentication required.');
    }
    throw error;
  }
};

export const AuthService = {
  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(loginRequest),
    });
    
    const result = await response.json() as ApiResponse<AuthResponse>;
    
    if (response.ok) {
      const { accessToken } = result.data;
      if (accessToken) {
        Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
      }
      return result.data;
    }
    
    throw new Error(result.message || 'Login failed');
  },
  
  async register(registerRequest: RegisterRequest): Promise<void> {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerRequest),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }
  },
  
  async logout(): Promise<void> {
    const refreshToken = Cookies.get('refreshToken');
    
    try {
      await executeWithTokenRefresh(async (token) => {
        if (!token) return;
        
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ refreshToken }),
        });
      });
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
  },
  
  async getCurrentUser(): Promise<User> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/api/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json() as ApiResponse<User>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || 'Failed to fetch user data');
    });
  },
  
  async refreshTokens(): Promise<string | null> {
    return refreshTokens();
  }
};