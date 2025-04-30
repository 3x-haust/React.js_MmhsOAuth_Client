import { API_URL } from '@/shared/api/constants';

export const requestPasswordReset = async (email: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/v1/auth/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '비밀번호 재설정 요청 실패');
  }
};