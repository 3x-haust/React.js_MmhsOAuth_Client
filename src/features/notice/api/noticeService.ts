import { API_URL } from '@/shared/api/constants';
import { executeWithTokenRefresh } from '@/features/auth/api/authService';

interface NoticeAuthor {
  id: number;
  nickname: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author?: NoticeAuthor;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
}

export interface UpdateNoticeRequest {
  title?: string;
  content?: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const NoticeService = {
  async getNotices(includeInactive = false): Promise<Notice[]> {
    return executeWithTokenRefresh(async (token) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/v1/notice?includeInactive=${includeInactive}`, {
        method: 'GET',
        headers,
      });
      
      const result = await response.json() as ApiResponse<Notice[]>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || 'Failed to fetch notices');
    });
  },
  
  async getNoticeById(id: number): Promise<Notice> {
    return executeWithTokenRefresh(async (token) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/v1/notice/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });
      
      const result = await response.json() as ApiResponse<Notice>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || `Failed to fetch notice #${id}`);
    });
  },
  
  async createNotice(notice: CreateNoticeRequest): Promise<Notice> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/v1/notice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(notice),
      });
      
      const result = await response.json() as ApiResponse<Notice>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || 'Failed to create notice');
    });
  },
  
  async updateNotice(id: number, notice: UpdateNoticeRequest): Promise<Notice> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/v1/notice/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(notice),
      });
      
      const result = await response.json() as ApiResponse<Notice>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || `Failed to update notice #${id}`);
    });
  },
  
  async deleteNotice(id: number): Promise<void> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/v1/notice/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return;
      }
      
      const result = await response.json();
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || `Failed to delete notice #${id}`);
    });
  }
};