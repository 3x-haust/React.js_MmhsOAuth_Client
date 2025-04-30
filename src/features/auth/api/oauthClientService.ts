import { API_URL } from '@/shared/api/constants';
import { executeWithTokenRefresh } from './authService';

export interface OAuthClient {
  id: number;
  clientId: string;
  clientSecret: string;
  serviceName: string;
  serviceDomain: string;
  redirectUris: string[];
  scope: string;
  allowedUserType: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOAuthClientRequest {
  serviceName: string;
  serviceDomain: string;
  scope: string;
  redirectUris: string[];
  allowedUserType: string;
}

export interface UpdateOAuthClientRequest {
  serviceName?: string;
  serviceDomain?: string;
  scope?: string;
  redirectUris?: string[];
  allowedUserType?: string;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const OAuthClientService = {
  async getOAuthClients(): Promise<OAuthClient[]> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/api/v1/oauth-client`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json() as ApiResponse<OAuthClient[]>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || 'Failed to fetch OAuth clients');
    });
  },
  
  async getOAuthClientById(id: number): Promise<OAuthClient> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/api/v1/oauth-client/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json() as ApiResponse<OAuthClient>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || `Failed to fetch OAuth client #${id}`);
    });
  },
  
  async createOAuthClient(client: CreateOAuthClientRequest): Promise<OAuthClient> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/api/v1/oauth-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(client),
      });
      
      const result = await response.json() as ApiResponse<OAuthClient>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || 'Failed to create OAuth client');
    });
  },
  
  async updateOAuthClient(id: number, client: UpdateOAuthClientRequest): Promise<OAuthClient> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/api/v1/oauth-client/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(client),
      });
      
      const result = await response.json() as ApiResponse<OAuthClient>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || `Failed to update OAuth client #${id}`);
    });
  },
  
  async deleteOAuthClient(id: number): Promise<void> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/api/v1/oauth-client/${id}`, {
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
      
      throw new Error(result.message || `Failed to delete OAuth client #${id}`);
    });
  },
  
  async regenerateClientSecret(id: number): Promise<{ clientSecret: string }> {
    return executeWithTokenRefresh(async (token) => {
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${API_URL}/api/v1/oauth-client/${id}/secret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json() as ApiResponse<{ clientSecret: string }>;
      
      if (response.ok) {
        return result.data;
      }
      
      if (result.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }
      
      throw new Error(result.message || `Failed to regenerate client secret for OAuth client #${id}`);
    });
  }
};