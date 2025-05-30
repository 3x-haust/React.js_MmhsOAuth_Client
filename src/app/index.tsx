import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { DocsPage } from '../pages/docs';

import { theme } from '@/app/styles';
import { useAuthStore } from '@/features/auth';
import { AdminDashboardPage, UserManagementPage, UserEditPage } from '@/pages/admin';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { NotFoundPage } from '@/pages/notfound';
import { NoticesPage, NoticeDetailPage, CreateNoticePage, EditNoticePage } from '@/pages/notices';
import { OAuthCallback } from '@/pages/oauth';
import { ConsentPage } from '@/pages/oauth/consent';
import { EditOAuthAppPage } from '@/pages/oauth/edit';
import { ManageOAuthAppsPage } from '@/pages/oauth/manage';
import { NewOAuthAppPage } from '@/pages/oauth/new';
import { ProfilePage } from '@/pages/profile';
import ResetPasswordPage from '@/pages/reset-password';
import { Footer, Header } from '@/widgets';

const getPageName = (path: string): string => {
  const pathMap: Record<string, string> = {
    '/': '홈',
    '/login': '로그인',
    '/docs': '문서',
    '/notices': '공지사항',
    '/oauth/manage': 'OAuth 앱 관리',
    '/admin': '관리자 대시보드',
    '/admin/users': '사용자 관리',
    '/profile': '마이페이지',
  };

  for (const [key, value] of Object.entries(pathMap)) {
    if (path.startsWith(key) && key !== '/') {
      if (path !== key) {
        if (key === '/notices' && !path.includes('new') && !path.includes('edit')) {
          return '공지사항 상세';
        } else if (key === '/oauth/edit') {
          return 'OAuth 앱 편집';
        } else if (key === '/admin/users' && path.includes('edit')) {
          return '사용자 정보 편집';
        }
      }
      return value;
    }
  }
  return pathMap[path] || path;
};

const saveRecentPage = (path: string) => {
  try {
    if (path === '*' || path === '/login') return;

    const pathName = getPageName(path);
    const recentPagesStr = localStorage.getItem('recentPages');
    let recentPages: { path: string; name: string }[] = [];

    if (recentPagesStr) {
      recentPages = JSON.parse(recentPagesStr);
    }

    recentPages = recentPages.filter(page => page.path !== path);

    recentPages.unshift({ path, name: pathName });

    recentPages = recentPages.slice(0, 10);

    localStorage.setItem('recentPages', JSON.stringify(recentPages));
  } catch (error) {
    console.error('Failed to save recent pages:', error);
  }
};

function App() {
  const { initializeAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    saveRecentPage(location.pathname);
  }, [location.pathname]);

  const showHeaderFooter = location.pathname !== '/login';

  return (
    <>
      <ThemeProvider theme={theme}>
        {showHeaderFooter && <Header />}
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/' element={<HomePage />} />
          <Route path='/oauth' element={<OAuthCallback />} />
          <Route path='/oauth/consent' element={<ConsentPage />} />
          <Route path='/oauth/manage' element={<ManageOAuthAppsPage />} />
          <Route path='/oauth/new' element={<NewOAuthAppPage />} />
          <Route path='/oauth/edit/:id' element={<EditOAuthAppPage />} />
          <Route path='/docs' element={<DocsPage />} />
          <Route path='/notices' element={<NoticesPage />} />
          <Route path='/notices/:id' element={<NoticeDetailPage />} />
          <Route path='/notices/new' element={<CreateNoticePage />} />
          <Route path='/notices/:id/edit' element={<EditNoticePage />} />
          <Route path='/admin' element={<AdminDashboardPage />} />
          <Route path='/admin/users' element={<UserManagementPage />} />
          <Route path='/admin/users/:id/edit' element={<UserEditPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/reset-password/:token' element={<ResetPasswordPage />} />

          <Route path='*' element={<NotFoundPage />} />
        </Routes>
        {showHeaderFooter && <Footer />}
      </ThemeProvider>
    </>
  );
}

export default App;
