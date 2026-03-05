import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import {
  NoticeService,
  CreateNoticeRequest,
  UpdateNoticeRequest,
} from '@/features/notice/api/noticeService';
import { NoticeForm } from '@/pages/notices/components/NoticeForm';

const CreateContainer = styled.div`
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

export const CreateNoticePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/notices', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (data: CreateNoticeRequest | UpdateNoticeRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const newNotice = await NoticeService.createNotice(data as CreateNoticeRequest);
      navigate(`/notices/${newNotice.id}`, { replace: true });
    } catch (createError) {
      setError('공지사항 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error creating notice:', createError);
      setIsLoading(false);
    }
  };

  return (
    <CreateContainer>
      <HeaderCard>
        <PageTitle>새 공지사항 작성</PageTitle>
        <Description>공지 제목과 내용을 작성한 뒤 등록하세요.</Description>
      </HeaderCard>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormWrapper>
        <NoticeForm onSubmit={handleSubmit} isLoading={isLoading} />
      </FormWrapper>
    </CreateContainer>
  );
};
