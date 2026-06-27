import Cookies from 'js-cookie';

import { executeWithTokenRefresh } from '@/features/auth/api/authService';

interface ClientInfo {
  id: number;
  clientId: string;
  serviceName: string;
  serviceDomain: string;
  scope: string;
  allowedUserType: string;
}

interface OAuthApp {
  id: number;
  clientId: string;
  clientSecret: string;
  serviceName: string;
  serviceDomain: string;
  scope: string;
  redirectUris: string[];
  allowedUserType: string;
}

interface ConsentRequestPayload {
  client_id: string | null;
  redirect_uri: string | null;
  state: string | null;
  approved: boolean;
  scope: string | null;
}

interface OAuthAppFormData {
  serviceName: string;
  serviceDomain: string;
  scope: string;
  redirectUris: string[];
  allowedUserType: string;
}

type ApplicationStatusResponse = {
  status: number;
  message: string;
  data: {
    status?: string;
    [key: string]: unknown;
  } | null;
};

const isTokenExpiredResponse = (data: unknown, httpStatus: number): boolean => {
  const status = data && typeof data === 'object' && 'status' in data ? data.status : httpStatus;
  const message = data && typeof data === 'object' && 'message' in data ? data.message : undefined;

  return (
    status === 401 ||
    message === 'TOKEN_EXPIRED' ||
    message === 'Token expired' ||
    message === '토큰이 만료되었습니다.'
  );
};

const fetchOAuthJson = async (path: string, init: RequestInit = {}) => {
  return executeWithTokenRefresh(async token => {
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}${path}`, {
      ...init,
      headers,
    });
    const data = await response.json();

    if (isTokenExpiredResponse(data, response.status)) {
      throw new Error('TOKEN_EXPIRED');
    }

    return data;
  });
};

export const refreshToken = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: Cookies.get('refreshToken') }),
    });

    const data = await response.json();

    if (data.status === 200 && data.data?.accessToken) {
      const currentRefreshToken = Cookies.get('refreshToken');
      Cookies.set('accessToken', data.data.accessToken, { secure: true, sameSite: 'Strict' });
      return {
        ...data.data,
        refreshToken: data.data.refreshToken || currentRefreshToken,
      };
    } else {
      throw new Error(data.message || 'Failed to refresh token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const getClientInfo = async (clientId: string) => {
  return fetchOAuthJson(`/api/v1/oauth-client/client/${clientId}`);
};

export const submitConsent = async (consentData: ConsentRequestPayload) => {
  return fetchOAuthJson('/api/v1/oauth/consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(consentData),
  });
};

export const approveConsent = async (consentData: ConsentRequestPayload) => {
  return fetchOAuthJson('/api/v1/oauth/consent/approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(consentData),
  });
};

export const getOAuthApp = async (id: string) => {
  return fetchOAuthJson(`/api/v1/oauth-client/${id}`);
};

export const getOAuthApps = async () => {
  return fetchOAuthJson('/api/v1/oauth-client');
};

export const createOAuthApp = async (formData: OAuthAppFormData) => {
  return fetchOAuthJson('/api/v1/oauth-client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
};

export const updateOAuthApp = async (id: string, formData: OAuthAppFormData) => {
  return fetchOAuthJson(`/api/v1/oauth-client/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
};

export const deleteOAuthApp = async (id: number) => {
  return fetchOAuthJson(`/api/v1/oauth-client/${id}`, {
    method: 'DELETE',
  });
};

export const checkApplicationStatus = async (
  clientId: string
): Promise<ApplicationStatusResponse> => {
  try {
    return (await fetchOAuthJson(
      `/api/v1/user/applications/${clientId}/status`
    )) as ApplicationStatusResponse;
  } catch (error) {
    console.error('애플리케이션 상태 확인 중 오류:', error);
    return {
      status: 500,
      message: '애플리케이션 상태를 확인하는 중 오류가 발생했습니다.',
      data: null,
    };
  }
};

export type { ClientInfo, OAuthApp };
