import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { NoticeService, Notice, UpdateNoticeRequest } from '../../features/notice/api/noticeService';
import { useAuthStore } from '../../features/auth';
import { NoticeForm } from './components/NoticeForm';

const EditContainer = styled.div`
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

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  
  &:after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid ${({ theme }) => theme.colors?.primary || '#5E81F4'};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  
  // Check if user is admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/notices', { replace: true });
    }
  }, [user, navigate]);
  
  // Fetch the notice data
  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await NoticeService.getNoticeById(parseInt(id, 10));
        setNotice(data);
        setError(null);
      } catch (err) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching notice:', err);
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
    } catch (err) {
      setError('공지사항 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error updating notice:', err);
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <EditContainer>
          <PageTitle>공지사항 수정</PageTitle>
          <LoadingSpinner />
        </EditContainer>
      </>
    );
  }
  
  if (!notice) {
    return (
      <>
        <EditContainer>
          <PageTitle>공지사항 수정</PageTitle>
          <ErrorMessage>
            공지사항을 찾을 수 없거나 존재하지 않는 공지사항입니다.
          </ErrorMessage>
        </EditContainer>
      </>
    );
  }
  
  return (
    <>
      <EditContainer>
        <PageTitle>공지사항 수정</PageTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <NoticeForm 
          initialData={notice}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </EditContainer>
    </>
  );
};