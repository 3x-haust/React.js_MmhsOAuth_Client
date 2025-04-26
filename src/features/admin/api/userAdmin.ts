import { API_URL } from '../../../shared/api/constants';
import Cookies from 'js-cookie';
import { User } from '../../auth/hooks';
import { executeWithTokenRefresh } from '../../auth/api/authService';

// Response interfaces
export interface AdminUserResponse {
  status: number;
  message: string;
  data?: User | User[];
}

// Get all users (admin only)
export const getAllUsers = async (): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/admin/users`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // 쿠키 포함
      }
    );

    const data = await response.json();
    
    // 401 상태 코드이거나 TOKEN_EXPIRED 메시지가 있으면 오류를 발생시킵니다
    if (response.status === 401 || data.message?.includes('TOKEN_EXPIRED')) {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};

// Get a user by ID (admin only)
export const getUserById = async (userId: number): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/admin/users/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // 쿠키 포함
      }
    );

    const data = await response.json();
    
    // 401 상태 코드이거나 TOKEN_EXPIRED 메시지가 있으면 오류를 발생시킵니다
    if (response.status === 401 || data.message?.includes('TOKEN_EXPIRED')) {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};

// Update a user (admin only)
export const updateUser = async (userId: number, userData: Partial<User>): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();
    
    // 401 상태 코드이거나 TOKEN_EXPIRED 메시지가 있으면 오류를 발생시킵니다
    if (response.status === 401 || data.message?.includes('TOKEN_EXPIRED')) {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};

// Delete a user (admin only)
export const deleteUser = async (userId: number): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // 쿠키 포함
      }
    );

    const data = await response.json();
    
    // 401 상태 코드이거나 TOKEN_EXPIRED 메시지가 있으면 오류를 발생시킵니다
    if (response.status === 401 || data.message?.includes('TOKEN_EXPIRED')) {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};