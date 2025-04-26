import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Notice, NoticeService } from '../../features/notice/api/noticeService';
import { useAuthStore } from '../../features/auth';

const DetailContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const NoticeHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const NoticeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
  font-size: 0.9rem;
`;

const AuthorDate = styled.div``;

const NoticeContent = styled.div`
  margin: 2rem 0;
  line-height: 1.8;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
`;

const Button = styled.button`
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const BackButton = styled(Link)`
  text-decoration: none;
  display: inline-block;
  padding: 0.7rem 1.5rem;
  background-color: ${({ theme }) => theme.colors?.background || '#f5f5f5'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors?.border || '#eee'};
  }
`;

const EditButton = styled(Link)`
  text-decoration: none;
  display: inline-block;
  padding: 0.7rem 1.5rem;
  background-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || '#4B6ED3'};
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors?.error || '#e74c3c'};
  color: white;
  border: none;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  
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

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors?.error || '#e74c3c'};
  background-color: #fef0f0;
  padding: 1rem;
  border-radius: 4px;
  margin: 2rem 0;
  text-align: center;
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const NoticeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isAdmin = user?.isAdmin === true;
  
  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await NoticeService.getNoticeById(parseInt(id, 10));
        setNotice(data);
      } catch (err) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching notice details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotice();
  }, [id]);
  
  const handleDelete = async () => {
    if (!id || !window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      await NoticeService.deleteNotice(parseInt(id, 10));
      navigate('/notices', { replace: true });
    } catch (err) {
      setError('공지사항을 삭제하는 중 오류가 발생했습니다.');
      console.error('Error deleting notice:', err);
      setDeleteLoading(false);
    }
  };
  
  if (loading) {
    return (
      <>
        <DetailContainer>
          <LoadingSpinner />
        </DetailContainer>
      </>
    );
  }
  
  if (!notice) {
    return (
      <>
        <DetailContainer>
          <ErrorMessage>
            공지사항을 찾을 수 없거나 존재하지 않는 공지사항입니다.
          </ErrorMessage>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <BackButton to="/notices">공지사항 목록으로</BackButton>
          </div>
        </DetailContainer>
      </>
    );
  }
  
  return (
    <>
      <DetailContainer>
        <NoticeHeader>
          <Title>{notice.title}</Title>
          <NoticeInfo>
            <AuthorDate>
              {notice.author ? `작성자: ${notice.author.nickname} • ` : ''}
              {formatDate(notice.createdAt)}
            </AuthorDate>
          </NoticeInfo>
        </NoticeHeader>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <NoticeContent>
          {notice.content}
        </NoticeContent>
        
        <ActionButtons>
          <BackButton to="/notices">목록으로 돌아가기</BackButton>
          
          {isAdmin && (
            <div>
              <EditButton to={`/notices/${notice.id}/edit`} style={{ marginRight: '1rem' }}>
                수정
              </EditButton>
              <DeleteButton onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? '처리 중...' : '삭제'}
              </DeleteButton>
            </div>
          )}
        </ActionButtons>
      </DetailContainer>
    </>
  );
};