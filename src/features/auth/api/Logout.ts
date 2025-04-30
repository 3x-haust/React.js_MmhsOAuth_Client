import { AuthResponse } from ".";
import { API_URL } from '@/shared/api/constants';


export const logOut = async (
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || '로그인 실패');
  }

  return responseData;
};