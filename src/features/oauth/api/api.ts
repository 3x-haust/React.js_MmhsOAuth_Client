import Cookies from 'js-cookie';

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
      Cookies.set('accessToken', data.data.accessToken, { secure: true, sameSite: 'Strict' });
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to refresh token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const getClientInfo = async (clientId: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    }
  );
  return await res.json();
};

export const submitConsent = async (consentData: ConsentRequestPayload) => {
  const res = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth/consent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('accessToken')}`,
    },
    body: JSON.stringify(consentData),
  });

  return await res.json();
};

export const approveConsent = async (consentData: ConsentRequestPayload) => {
  const res = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth/consent/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('accessToken')}`,
    },
    body: JSON.stringify(consentData),
  });

  return await res.json();
};

export const getOAuthApp = async (id: string) => {
  const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client/${id}`, {
    headers: {
      Authorization: `Bearer ${Cookies.get('accessToken')}`,
    },
  });

  return await response.json();
};

export const getOAuthApps = async () => {
  const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client`, {
    headers: {
      Authorization: `Bearer ${Cookies.get('accessToken')}`,
    },
  });

  return await response.json();
};

export const createOAuthApp = async (formData: OAuthAppFormData) => {
  const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('accessToken')}`,
    },
    body: JSON.stringify(formData),
  });

  return await response.json();
};

export const updateOAuthApp = async (id: string, formData: OAuthAppFormData) => {
  const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('accessToken')}`,
    },
    body: JSON.stringify(formData),
  });

  return await response.json();
};

export const deleteOAuthApp = async (id: number) => {
  const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${Cookies.get('accessToken')}`,
    },
  });

  return await response.json();
};

export const checkApplicationStatus = async (clientId: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_SERVER_URL}/api/v1/user/applications/${clientId}/status`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
      }
    );
    
    // 401 에러 처리 (토큰 만료 등)
    if (response.status === 401) {
      try {
        const refreshResult = await refreshToken();
        if (refreshResult) {
          // 토큰을 새로 받았으니 재시도
          return checkApplicationStatus(clientId);
        }
      } catch (error) {
        console.error('토큰 갱신 실패:', error);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('애플리케이션 상태 확인 중 오류:', error);
    return {
      status: 500,
      message: '애플리케이션 상태를 확인하는 중 오류가 발생했습니다.',
      data: null
    };
  }
};

export type { ClientInfo, OAuthApp };
