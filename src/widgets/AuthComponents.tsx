import { useAuthStore } from '@/features/auth';
import { AuthModal } from '@/features/auth/user';

export const AuthModalWrapper: React.FC = () => {
  const { isLoggedIn, isAuthModalOpen, setIsAuthModalOpen } = useAuthStore();

  return (
    <AuthModal isOpen={!isLoggedIn && isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
  );
};
