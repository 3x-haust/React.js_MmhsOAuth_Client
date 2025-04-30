import { AuthResponse } from ".";
import { API_URL } from '@/shared/api/constants';

export const verifyResetToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/verify-reset-token/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (data.status !== 200) {
      throw new Error(data.message || '토큰 검증에 실패했습니다.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
};