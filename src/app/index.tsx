import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { AdminDashboardPage, UserEditPage, UserManagementPage } from '@/pages/admin';
import { CreateDocPage, DocDetailPage, DocsPage, EditDocPage } from '@/pages/docs';
import { LoginPage } from '@/pages/login';
import { NotFoundPage } from '@/pages/notfound';
import { CreateNoticePage, EditNoticePage, NoticeDetailPage, NoticesPage } from '@/pages/notices';
import { OAuthCallback } from '@/pages/oauth';
import { ConsentPage } from '@/pages/oauth/consent';
import { EditOAuthAppPage } from '@/pages/oauth/edit';
import { ManageOAuthAppsPage } from '@/pages/oauth/manage';
import { NewOAuthAppPage } from '@/pages/oauth/new';
import { ProfilePage } from '@/pages/profile';
import ResetPasswordPage from '@/pages/reset-password';
import { SettingsPage } from '@/pages/settings';
import { UserSearchDetailPage, UserSearchPage } from '@/pages/user-search';
import { ShellLayout } from '@/widgets';

const getPageName = (path: string): string => {
  if (path === '/') return 'OAuth 앱 관리';
  if (path.startsWith('/oauth/manage')) return 'OAuth 앱 관리';
  if (path.startsWith('/oauth/new')) return 'OAuth 앱 생성';
  if (path.startsWith('/oauth/edit')) return 'OAuth 앱 편집';
  if (path.startsWith('/docs/new')) return '개발 문서 작성';
  if (path.startsWith('/docs/') && path.endsWith('/edit')) return '개발 문서 수정';
  if (path.startsWith('/docs/')) return '개발 문서 상세';
  if (path.startsWith('/docs')) return '개발 문서';
  if (path.startsWith('/user-search')) return '유저 검색';
  if (path.startsWith('/notices/new')) return '공지사항 작성';
  if (path.startsWith('/notices/') && path.endsWith('/edit')) return '공지사항 수정';
  if (path.startsWith('/notices/')) return '공지사항 상세';
  if (path.startsWith('/notices')) return '공지사항';
  if (path.startsWith('/admin/users/') && path.endsWith('/edit')) return '사용자 편집';
  if (path.startsWith('/admin/users')) return '사용자 관리';
  if (path.startsWith('/admin')) return '관리자 대시보드';
  if (path.startsWith('/profile')) return '내 계정';
  if (path.startsWith('/settings')) return '설정';
  return path;
};

const saveRecentPage = (path: string) => {
  try {
    const excluded = ['/login', '/oauth', '/oauth/consent'];
    if (excluded.includes(path) || path.startsWith('/reset-password/')) {
      return;
    }

    const current = localStorage.getItem('recentPages');
    const pages: { path: string; name: string }[] = current ? JSON.parse(current) : [];
    const next = pages.filter(page => page.path !== path);

    next.unshift({
      path,
      name: getPageName(path),
    });

    localStorage.setItem('recentPages', JSON.stringify(next.slice(0, 10)));
  } catch (error) {
    console.error('Failed to save recent pages:', error);
  }
};

const App = () => {
  const { initializeAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    saveRecentPage(location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/oauth' element={<OAuthCallback />} />
      <Route path='/oauth/consent' element={<ConsentPage />} />
      <Route path='/reset-password/:token' element={<ResetPasswordPage />} />

      <Route element={<ShellLayout />}>
        <Route path='/' element={<Navigate to='/oauth/manage' replace />} />
        <Route path='/user-search' element={<UserSearchPage />} />
        <Route path='/user-search/detail' element={<UserSearchDetailPage />} />
        <Route path='/oauth/manage' element={<ManageOAuthAppsPage />} />
        <Route path='/oauth/new' element={<NewOAuthAppPage />} />
        <Route path='/oauth/edit/:id' element={<EditOAuthAppPage />} />
        <Route path='/docs' element={<DocsPage />} />
        <Route path='/docs/new' element={<CreateDocPage />} />
        <Route path='/docs/:id' element={<DocDetailPage />} />
        <Route path='/docs/:id/edit' element={<EditDocPage />} />
        <Route path='/notices' element={<NoticesPage />} />
        <Route path='/notices/:id' element={<NoticeDetailPage />} />
        <Route path='/notices/new' element={<CreateNoticePage />} />
        <Route path='/notices/:id/edit' element={<EditNoticePage />} />
        <Route path='/admin' element={<AdminDashboardPage />} />
        <Route path='/admin/users' element={<UserManagementPage />} />
        <Route path='/admin/users/:id/edit' element={<UserEditPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
