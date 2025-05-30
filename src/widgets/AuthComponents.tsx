import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth';
import { AuthModal } from '@/features/auth/user';

export const AuthModalWrapper: React.FC = () => {
  const { isLoggedIn, initializeAuth, isAuthModalOpen, setIsAuthModalOpen } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
    }
  }, [initializeAuth, isLoggedIn, setIsAuthModalOpen]);

  return (
    <AuthModal isOpen={!isLoggedIn && isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
  );
};
