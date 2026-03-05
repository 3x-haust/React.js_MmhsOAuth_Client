import { executeWithTokenRefresh } from '@/features/auth/api/authService';
import { API_URL } from '@/shared/api/constants';

interface DeveloperDocAuthor {
  id: number;
  nickname: string;
}

export interface DeveloperDoc {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: DeveloperDocAuthor;
}

export interface CreateDeveloperDocRequest {
  title: string;
  content: string;
}

export interface UpdateDeveloperDocRequest {
  title?: string;
  content?: string;
  isPublished?: boolean;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const DeveloperDocService = {
  async getDocs(includeUnpublished = false): Promise<DeveloperDoc[]> {
    return executeWithTokenRefresh(async token => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/v1/developer-docs?includeUnpublished=${includeUnpublished}`,
        {
          method: 'GET',
          headers,
        }
      );

      const result = (await response.json()) as ApiResponse<DeveloperDoc[]>;

      if (response.ok) {
        return result.data;
      }

      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }

      throw new Error(result.message || 'Failed to fetch developer documents');
    });
  },

  async getDocById(id: number): Promise<DeveloperDoc> {
    return executeWithTokenRefresh(async token => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/v1/developer-docs/${id}`, {
        method: 'GET',
        headers,
      });

      const result = (await response.json()) as ApiResponse<DeveloperDoc>;

      if (response.ok) {
        return result.data;
      }

      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }

      throw new Error(result.message || `Failed to fetch developer document #${id}`);
    });
  },

  async createDoc(doc: CreateDeveloperDocRequest): Promise<DeveloperDoc> {
    return executeWithTokenRefresh(async token => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/v1/developer-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(doc),
      });

      const result = (await response.json()) as ApiResponse<DeveloperDoc>;

      if (response.ok) {
        return result.data;
      }

      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }

      throw new Error(result.message || 'Failed to create developer document');
    });
  },

  async updateDoc(id: number, doc: UpdateDeveloperDocRequest): Promise<DeveloperDoc> {
    return executeWithTokenRefresh(async token => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/v1/developer-docs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(doc),
      });

      const result = (await response.json()) as ApiResponse<DeveloperDoc>;

      if (response.ok) {
        return result.data;
      }

      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }

      throw new Error(result.message || `Failed to update developer document #${id}`);
    });
  },

  async deleteDoc(id: number): Promise<void> {
    return executeWithTokenRefresh(async token => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/v1/developer-docs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return;
      }

      const result = await response.json();

      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }

      throw new Error(result.message || `Failed to delete developer document #${id}`);
    });
  },
};
