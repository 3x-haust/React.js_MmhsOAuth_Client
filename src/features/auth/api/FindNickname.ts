import { API_URL } from '@/shared/api/constants';

export const findNickname = async (email: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/v1/auth/find-nickname`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '닉네임 찾기 실패');
  }
};
