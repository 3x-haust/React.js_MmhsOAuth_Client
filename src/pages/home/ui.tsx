import { useAuthStore } from "../../features/auth";
import { AuthModalWrapper } from "../../widgets";

export const HomePage = () => {
  const { isLoggedIn, logout, setIsAuthModalOpen } = useAuthStore();

  const handleLogout = () => {
    if (isLoggedIn) {
      logout();
    } else {
      setIsAuthModalOpen(true);
    }
  };


  return (
    <>
      <button onClick={handleLogout}>로그아웃</button>
      <AuthModalWrapper />
    </>
  );
};