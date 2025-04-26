import { AuthResponse } from ".";
import { API_URL } from '../../../shared/api/constants';

export const signUp = async (
  userData: {
    email: string;
    nickname: string;
    password: string;
    code: string;
  }
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || '회원가입 실패');
  }

  return responseData;
};