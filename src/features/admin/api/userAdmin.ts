import { User } from '../../auth/hooks';

import { executeWithTokenRefresh } from '@/features/auth/api/authService';
import { API_URL } from '@/shared/api/constants';

export interface AdminUserResponse {
  status: number;
  message: string;
  data?: User | User[];
}

export const getAllUsers = async (): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async token => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(`${API_URL}/api/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }

    return data;
  });
};

export const getUserById = async (userId: number): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async token => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }

    return data;
  });
};

export const updateUser = async (
  userId: number,
  userData: Partial<User>
): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async token => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }

    return data;
  });
};

export const deleteUser = async (userId: number): Promise<AdminUserResponse> => {
  return executeWithTokenRefresh(async token => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(`${API_URL}/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }

    return data;
  });
};
