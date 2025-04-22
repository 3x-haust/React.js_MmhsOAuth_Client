import { User } from '../hooks';
import Cookies from 'js-cookie';

export interface GetUserInfoResponse {
  status: number;
  message: string;
  data?: User;
}

export const getUserInfo = async (token?: string): Promise<GetUserInfoResponse> => {
  try {
    const accessToken = token || Cookies.get('accessToken');
    
    if (!accessToken) {
      return {
        status: 401,
        message: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch(
      `${import.meta.env.VITE_APP_SERVER_URL}/api/v1/user`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return {
      status: 500,
      message: '사용자 정보를 가져오는데 실패했습니다.',
    };
  }
};