import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { Notice, NoticeService } from '@/features/notice/api/noticeService';
import { getOAuthApps, OAuthApp } from '@/features/oauth';

type OAuthAppsResponse = {
  status: number;
  message?: string;
  data?: OAuthApp[];
};

type RecentPage = {
  path: string;
  name: string;
};

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  width: min(1420px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Intro = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 22px 20px;
  animation: ${riseIn} 0.3s ease both;
`;

const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.mutedText};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.74rem;
  font-weight: 600;
`;

const IntroTitle = styled.h2`
  margin-top: 8px;
  font-size: clamp(1.2rem, 2vw, 1.58rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const IntroDescription = styled.p`
  margin-top: 9px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.91rem;
  line-height: 1.5;
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
`;

const MetricRow = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Card = styled.article<{ $delay: number }>`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 15px;
  animation: ${riseIn} 0.32s ease both;
  animation-delay: ${({ $delay }) => `${$delay}ms`};
`;

const MetricLabel = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const MetricValue = styled.h3`
  margin-top: 8px;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.01em;
`;

const MetricSub = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.81rem;
`;

const Wide = styled(Card)`
  grid-column: span 8;

  @media (max-width: 1180px) {
    grid-column: 1 / -1;
  }
`;

const Narrow = styled(Card)`
  grid-column: span 4;

  @media (max-width: 1180px) {
    grid-column: 1 / -1;
  }
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.98rem;
  margin-bottom: 12px;
`;

const ScopeList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ScopeItem = styled.li`
  display: grid;
  grid-template-columns: 110px 1fr auto;
  align-items: center;
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 90px 1fr auto;
  }
`;

const ScopeName = styled.span`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const ScopeBar = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 7px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ScopeFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${({ $width }) => `${$width}%`};
  background-color: ${({ theme }) => theme.colors.primary};
`;

const ScopeCount = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.85rem;
`;

const NoticeList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NoticeItem = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

const NoticeLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.86rem;
  line-height: 1.4;
`;

const NoticeDate = styled.span`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.75rem;
  white-space: nowrap;
`;

const RecentList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecentItem = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
`;

const RecentLink = styled(Link)`
  display: block;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.84rem;
  padding: 10px 12px;
`;

const ActionList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? theme.colors.primaryDark : theme.colors.border)};
  background-color: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.surfaceElevated};
  color: ${({ theme, $primary }) => ($primary ? '#ffffff' : theme.colors.text)};
  border-radius: 10px;
  height: 38px;
  font-size: 0.84rem;
  font-weight: 600;
`;

const InlineError = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.81rem;
  margin-bottom: 8px;
`;

const formatNoticeDate = (value: string): string => {
  return new Date(value).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  });
};

const formatLongDate = (value: string): string => {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const getScopeStats = (apps: OAuthApp[]) => {
  const map = new Map<string, number>();
  apps.forEach(app => {
    app.scope
      .split(',')
      .map(scope => scope.trim())
      .filter(Boolean)
      .forEach(scope => {
        map.set(scope, (map.get(scope) ?? 0) + 1);
      });
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

const getRecentPages = (): RecentPage[] => {
  try {
    const raw = localStorage.getItem('recentPages');
    if (!raw) {
      return [];
    }
    const pages = JSON.parse(raw) as RecentPage[];
    return pages.filter(page => page.path !== '/').slice(0, 5);
  } catch (error) {
    console.error('Failed to read recent pages:', error);
    return [];
  }
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [noticeError, setNoticeError] = useState('');
  const [appsError, setAppsError] = useState('');

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setNoticeLoading(true);
        setNoticeError('');
        const response = await NoticeService.getNotices(false);
        setNotices(response.slice(0, 5));
      } catch (error) {
        console.error('Failed to load notices:', error);
        setNoticeError('공지사항을 불러오지 못했습니다.');
      } finally {
        setNoticeLoading(false);
      }
    };

    loadNotices();
    setRecentPages(getRecentPages());
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      if (!isLoggedIn) {
        setApps([]);
        setAppsError('');
        return;
      }

      try {
        setAppsLoading(true);
        setAppsError('');
        const response = (await getOAuthApps()) as OAuthAppsResponse;
        if (response.status === 200) {
          setApps(response.data ?? []);
          return;
        }
        setApps([]);
        setAppsError(response.message ?? '앱 데이터를 불러오지 못했습니다.');
      } catch (error) {
        console.error('Failed to load oauth apps:', error);
        setApps([]);
        setAppsError('앱 데이터를 불러오지 못했습니다.');
      } finally {
        setAppsLoading(false);
      }
    };

    loadApps();
  }, [isLoggedIn]);

  const scopeStats = useMemo(() => getScopeStats(apps), [apps]);
  const maxScopeCount = scopeStats.length ? scopeStats[0][1] : 1;
  const latestNoticeDate = notices.length > 0 ? formatLongDate(notices[0].createdAt) : '-';

  return (
    <Page>
      <Intro>
        <Eyebrow>Operational View</Eyebrow>
        <IntroTitle>미림 OAuth 서비스 현황</IntroTitle>
        <IntroDescription>
          앱 등록 상태, 권한 범위 분포, 공지 및 최근 이동 페이지를 한 화면에서 확인할 수 있습니다.
        </IntroDescription>
      </Intro>

      <Grid>
        <MetricRow>
          <Card $delay={20}>
            <MetricLabel>등록된 OAuth 앱</MetricLabel>
            <MetricValue>{isLoggedIn ? (appsLoading ? '-' : apps.length) : '-'}</MetricValue>
            <MetricSub>{isLoggedIn ? '내 계정 기준' : '로그인 후 확인 가능'}</MetricSub>
          </Card>

          <Card $delay={40}>
            <MetricLabel>활성 스코프 종류</MetricLabel>
            <MetricValue>{isLoggedIn ? (appsLoading ? '-' : scopeStats.length) : '-'}</MetricValue>
            <MetricSub>앱 전체에서 사용 중인 권한 범위</MetricSub>
          </Card>

          <Card $delay={60}>
            <MetricLabel>최근 공지 등록일</MetricLabel>
            <MetricValue>{noticeLoading ? '-' : latestNoticeDate}</MetricValue>
            <MetricSub>{noticeLoading ? '로딩 중' : '최신 공지 기준'}</MetricSub>
          </Card>

          <Card $delay={80}>
            <MetricLabel>계정 상태</MetricLabel>
            <MetricValue>{isLoggedIn ? 'Authenticated' : 'Guest'}</MetricValue>
            <MetricSub>
              {isLoggedIn ? `${user?.nickname ?? '사용자'} 계정` : '로그인 필요'}
            </MetricSub>
          </Card>
        </MetricRow>

        <Wide $delay={120}>
          <SectionTitle>스코프 분포</SectionTitle>
          {appsError && <InlineError>{appsError}</InlineError>}
          {!isLoggedIn && <Empty>로그인하면 OAuth 앱 스코프 분포를 확인할 수 있습니다.</Empty>}
          {isLoggedIn && appsLoading && <Empty>스코프 데이터를 불러오는 중입니다.</Empty>}
          {isLoggedIn && !appsLoading && scopeStats.length === 0 && (
            <Empty>등록된 OAuth 앱이 없어 표시할 데이터가 없습니다.</Empty>
          )}
          {isLoggedIn && !appsLoading && scopeStats.length > 0 && (
            <ScopeList>
              {scopeStats.map(([scope, count]) => (
                <ScopeItem key={scope}>
                  <ScopeName>{scope}</ScopeName>
                  <ScopeBar>
                    <ScopeFill $width={(count / maxScopeCount) * 100} />
                  </ScopeBar>
                  <ScopeCount>{count}</ScopeCount>
                </ScopeItem>
              ))}
            </ScopeList>
          )}
        </Wide>

        <Narrow $delay={140}>
          <SectionTitle>빠른 액션</SectionTitle>
          <ActionList>
            <ActionButton
              type='button'
              $primary
              onClick={() => navigate(isLoggedIn ? '/oauth/new' : '/login')}
            >
              OAuth 앱 등록
            </ActionButton>
            <ActionButton type='button' onClick={() => navigate('/oauth/manage')}>
              OAuth 앱 관리
            </ActionButton>
            <ActionButton type='button' onClick={() => navigate('/docs')}>
              개발 문서 보기
            </ActionButton>
            <ActionButton type='button' onClick={() => navigate('/notices')}>
              공지사항 보기
            </ActionButton>
          </ActionList>
        </Narrow>

        <Wide $delay={160}>
          <SectionTitle>최근 공지</SectionTitle>
          {noticeError && <InlineError>{noticeError}</InlineError>}
          {noticeLoading && <Empty>공지사항을 불러오는 중입니다.</Empty>}
          {!noticeLoading && notices.length === 0 && <Empty>표시할 공지사항이 없습니다.</Empty>}
          {!noticeLoading && notices.length > 0 && (
            <NoticeList>
              {notices.map(notice => (
                <NoticeItem key={notice.id}>
                  <NoticeLink to={`/notices/${notice.id}`}>
                    <span>{notice.title}</span>
                    <NoticeDate>{formatNoticeDate(notice.createdAt)}</NoticeDate>
                  </NoticeLink>
                </NoticeItem>
              ))}
            </NoticeList>
          )}
        </Wide>

        <Narrow $delay={180}>
          <SectionTitle>최근 방문 페이지</SectionTitle>
          {recentPages.length === 0 && <Empty>최근 방문 기록이 없습니다.</Empty>}
          {recentPages.length > 0 && (
            <RecentList>
              {recentPages.map(page => (
                <RecentItem key={page.path}>
                  <RecentLink to={page.path}>{page.name}</RecentLink>
                </RecentItem>
              ))}
            </RecentList>
          )}
        </Narrow>
      </Grid>
    </Page>
  );
};
