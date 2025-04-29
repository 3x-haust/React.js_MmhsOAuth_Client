import { API_URL } from '../../../shared/api/constants';
import { executeWithTokenRefresh } from '../../auth/api/authService';
import { User } from '../../auth/hooks';

export interface UpdateProfileRequest {
  email?: string;
  nickname?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ProfileResponse {
  status: number;
  message: string;
  data?: User;
}

export interface ConnectedApp {
  id: number;
  clientId: string;
  serviceName: string;
  serviceDomain: string;
  scope: string;
  grantedAt: string;
  revokedAt: string | null;
}

export interface PermissionHistory {
  id: number;
  applicationName: string;
  applicationDomain: string;
  permissionScopes: string;
  timestamp: string;
  status: 'active' | 'revoked';
}

export interface ApplicationsResponse {
  status: number;
  message: string;
  data?: ConnectedApp[];
}

export interface PermissionsHistoryResponse {
  status: number;
  message: string;
  data?: PermissionHistory[];
}

export interface RevokeApplicationResponse {
  status: number;
  message: string;
  data?: { clientId: string };
}

export const updateProfile = async (profileData: UpdateProfileRequest): Promise<ProfileResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/user/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      }
    );

    const data = await response.json();
    
    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};

export const getConnectedApplications = async (): Promise<ApplicationsResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/user/applications`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();    
    
    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};

export const revokeApplication = async (clientId: string): Promise<RevokeApplicationResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/user/applications/${clientId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};

export const getPermissionsHistory = async (): Promise<PermissionsHistoryResponse> => {
  return executeWithTokenRefresh(async (token) => {
    if (!token) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${API_URL}/api/v1/user/permissions-history`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.message === 'TOKEN_EXPIRED') {
      throw new Error('TOKEN_EXPIRED');
    }
    
    return data;
  });
};