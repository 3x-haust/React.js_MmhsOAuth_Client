import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "@/features/auth";
import { AuthModalWrapper } from "@/widgets";
import { Notice, NoticeService } from '@/features/notice/api/noticeService';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 60px 0;

  @media (min-width: 768px) {
    margin: 80px 0;
  }
`;

const Headline = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors?.text || '#333'};

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const Subheadline = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
  max-width: 700px;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;

  @media (min-width: 576px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const Button = styled.button`
  padding: 14px 28px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: white;
  border: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || '#4B6ED3'};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  border: 2px solid ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryLight || '#EEF1FD'};
  }
`;

const RecentNoticesSection = styled.section`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoticeItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const NoticeTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 8px 0;
  font-weight: 500;
`;

const NoticeLink = styled(Link)`
  color: ${({ theme }) => theme.colors?.text || '#333'};
  text-decoration: none;
  
  &:hover {
    color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  }
`;

const NoticeDate = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
`;

const ViewAllLink = styled(Link)`
  display: inline-block;
  margin-top: 16px;
  color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NoNotices = styled.div`
  padding: 12px 0;
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
`;

export const HomePage = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNotices = async () => {
      try {
        setLoading(true);
        const notices = await NoticeService.getNotices(false);
        setRecentNotices(notices.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch recent notices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentNotices();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/oauth/manage');
    } else {
      navigate('/login');
    }
  };

  const handleViewDocs = () => {
    navigate('/docs');
  };

  return (
    <>
      <HomeContainer>
        <HeroSection>
          <Headline>미림마이스터고 OAuth 서비스</Headline>
          <Subheadline>
            미림마이스터고 학생 및 교사들의 안전한 인증 시스템을 위한 OAuth 서비스입니다.
          </Subheadline>
          <ButtonGroup>
            <PrimaryButton onClick={handleGetStarted}>
              {isLoggedIn ? 'OAuth 앱 관리' : '시작하기'}
            </PrimaryButton>
            <SecondaryButton onClick={handleViewDocs}>문서 보기</SecondaryButton>
          </ButtonGroup>
        </HeroSection>
        <RecentNoticesSection>
          <SectionTitle>공지사항</SectionTitle>
          <NoticeList>
            {loading ? (
              <div>공지사항 로딩 중...</div>
            ) : recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <NoticeItem key={notice.id}>
                  <NoticeTitle>
                    <NoticeLink to={`/notices/${notice.id}`}>
                      {notice.title}
                    </NoticeLink>
                  </NoticeTitle>
                  <NoticeDate>{formatDate(notice.createdAt)}</NoticeDate>
                </NoticeItem>
              ))
            ) : (
              <NoNotices>등록된 공지사항이 없습니다.</NoNotices>
            )}
          </NoticeList>
          <ViewAllLink to="/notices">모든 공지사항 보기 →</ViewAllLink>
        </RecentNoticesSection>
      </HomeContainer>
      
      <AuthModalWrapper />
    </>
  );
};