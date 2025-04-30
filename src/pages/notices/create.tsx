import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { NoticeService, CreateNoticeRequest, UpdateNoticeRequest } from '@/features/notice/api/noticeService';
import { useAuthStore } from '@/features/auth';
import { NoticeForm } from '@/pages/notices/components/NoticeForm';

const CreateContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors?.error || '#e74c3c'};
  background-color: #fef0f0;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  text-align: center;
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
    } catch (err) {
      setError('공지사항 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error creating notice:', err);
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <CreateContainer>
        <PageTitle>새 공지사항 작성</PageTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <NoticeForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </CreateContainer>
    </>
  );
};