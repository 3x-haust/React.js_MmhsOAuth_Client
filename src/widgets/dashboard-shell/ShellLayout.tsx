import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { MobileDrawer } from './MobileDrawer';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NavigationItem } from './types';

import { useAuthStore } from '@/features/auth';
import { AuthModal } from '@/features/auth/user';

const LayoutRoot = styled.div`
  min-height: 100dvh;
  display: flex;
  background-color: ${({ theme }) => theme.colors.background};
`;

const DesktopSidebar = styled.div`
  width: 248px;
  min-height: 100dvh;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  height: 100dvh;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
`;

const Main = styled.main<{ $blocked: boolean }>`
  flex: 1;
  padding: 18px 18px 24px;
  background-color: ${({ theme }) => theme.colors.background};
  pointer-events: ${({ $blocked }) => ($blocked ? 'none' : 'auto')};
  user-select: ${({ $blocked }) => ($blocked ? 'none' : 'auto')};
`;

const getPageMeta = (pathname: string): { title: string; subtitle: string } => {
  if (pathname === '/') return { title: 'OAuth 클라이언트', subtitle: '등록된 클라이언트 관리' };
  if (pathname.startsWith('/user-search')) {
    return { title: '유저 검색', subtitle: '닉네임 기준 사용자 조회' };
  }
  if (pathname.startsWith('/oauth/manage'))
    return { title: 'OAuth 클라이언트', subtitle: '등록된 클라이언트 관리' };
  if (pathname.startsWith('/oauth/new'))
    return { title: '클라이언트 생성', subtitle: '새 OAuth 애플리케이션 등록' };
  if (pathname.startsWith('/oauth/edit'))
    return { title: '클라이언트 편집', subtitle: '클라이언트 설정 수정' };
  if (pathname.startsWith('/docs')) return { title: '개발 문서', subtitle: '개발 관련 문서' };
  if (pathname.startsWith('/notices'))
    return { title: '공지사항', subtitle: '서비스 공지 및 변경사항' };
  if (pathname.startsWith('/admin/users'))
    return { title: '사용자 관리', subtitle: '관리자 권한 사용자 데이터 운영' };
  if (pathname.startsWith('/admin')) return { title: '관리자', subtitle: '운영 메뉴' };
  if (pathname.startsWith('/settings')) {
    return { title: '설정', subtitle: '테마 및 인터페이스 설정' };
  }
  if (pathname.startsWith('/profile')) {
    return { title: '내 계정', subtitle: '프로필 및 연결 앱 관리' };
  }
  return { title: '서비스', subtitle: '작업을 진행하세요' };
};

const navigationItems: NavigationItem[] = [
  { id: 'oauth', label: 'OAuth 클라이언트', to: '/oauth/manage' },
  { id: 'user-search', label: '유저 검색', to: '/user-search' },
  { id: 'docs', label: '개발 문서', to: '/docs' },
  { id: 'notices', label: '공지사항', to: '/notices' },
  { id: 'admin', label: '관리자', to: '/admin', requiresAuth: true, requiresAdmin: true },
];

export const ShellLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isAuthInitialized, isAuthModalOpen, setIsAuthModalOpen, user } =
    useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const meta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);
  const shouldOpenAuthModal = isAuthInitialized && !isLoggedIn && isAuthModalOpen;

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn && !isAuthModalOpen) {
      setIsAuthModalOpen(true);
    }
  }, [isAuthInitialized, isLoggedIn, isAuthModalOpen, location.pathname, setIsAuthModalOpen]);

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);

    if (useAuthStore.getState().isLoggedIn) {
      return;
    }

    const redirect = `${location.pathname}${location.search}`;
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <LayoutRoot>
      <DesktopSidebar>
        <Sidebar
          items={navigationItems}
          pathname={location.pathname}
          isLoggedIn={isLoggedIn}
          isAdmin={Boolean(user?.isAdmin)}
        />
      </DesktopSidebar>

      <MobileDrawer
        open={drawerOpen}
        pathname={location.pathname}
        items={navigationItems}
        isLoggedIn={isLoggedIn}
        isAdmin={Boolean(user?.isAdmin)}
        onClose={() => setDrawerOpen(false)}
      />

      <Content>
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuOpen={() => setDrawerOpen(true)}
        />
        <Main $blocked={isAuthInitialized && !isLoggedIn}>
          <Outlet />
        </Main>
      </Content>

      <AuthModal isOpen={shouldOpenAuthModal} onClose={handleAuthModalClose} />
    </LayoutRoot>
  );
};
