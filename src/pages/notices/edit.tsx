import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { NoticeService, Notice, UpdateNoticeRequest } from '@/features/notice/api/noticeService';
import { NoticeForm } from '@/pages/notices/components/NoticeForm';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const EditContainer = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const HeaderCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.2rem, 2vw, 1.55rem);
`;

const Description = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.86rem;
`;

const ErrorMessage = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.85rem;
`;

const FormWrapper = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

const LoadingCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 3px solid ${({ theme }) => theme.colors.border};
    border-top-color: ${({ theme }) => theme.colors.primary};
    animation: ${spin} 0.9s linear infinite;
  }
`;

export const EditNoticePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/notices', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await NoticeService.getNoticeById(parseInt(id, 10));
        setNotice(data);
        setError(null);
      } catch (fetchError) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching notice:', fetchError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  const handleSubmit = async (data: UpdateNoticeRequest) => {
    if (!id) return;

    try {
      setIsSaving(true);
      setError(null);
      await NoticeService.updateNotice(parseInt(id, 10), data);
      navigate(`/notices/${id}`, { replace: true });
    } catch (updateError) {
      setError('공지사항 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error updating notice:', updateError);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <EditContainer>
        <HeaderCard>
          <PageTitle>공지사항 수정</PageTitle>
          <Description>기존 공지사항 내용을 업데이트합니다.</Description>
        </HeaderCard>
        <LoadingCard />
      </EditContainer>
    );
  }

  if (!notice) {
    return (
      <EditContainer>
        <HeaderCard>
          <PageTitle>공지사항 수정</PageTitle>
          <Description>기존 공지사항 내용을 업데이트합니다.</Description>
        </HeaderCard>
        <ErrorMessage>공지사항을 찾을 수 없거나 존재하지 않는 공지사항입니다.</ErrorMessage>
      </EditContainer>
    );
  }

  return (
    <EditContainer>
      <HeaderCard>
        <PageTitle>공지사항 수정</PageTitle>
        <Description>기존 공지사항 내용을 업데이트합니다.</Description>
      </HeaderCard>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormWrapper>
        <NoticeForm initialData={notice} onSubmit={handleSubmit} isLoading={isSaving} />
      </FormWrapper>
    </EditContainer>
  );
};
