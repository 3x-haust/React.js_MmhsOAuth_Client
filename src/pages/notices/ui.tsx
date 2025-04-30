import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { Notice, NoticeService } from '@/features/notice/api/noticeService';

const NoticesContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const NoticesList = styled.div`
  margin-top: 2rem;
`;

const NoticeItem = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SkeletonItem = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const shimmer = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const SkeletonElement = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors?.skeleton || '#f0f0f0'} 25%,
    ${({ theme }) => theme.colors?.skeletonHighlight || '#f8f8f8'} 50%,
    ${({ theme }) => theme.colors?.skeleton || '#f0f0f0'} 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 4px;
  ${shimmer}
`;

const SkeletonTitle = styled(SkeletonElement)`
  height: 1.5rem;
  width: 70%;
  margin-bottom: 1rem;
`;

const SkeletonDate = styled(SkeletonElement)`
  height: 1rem;
  width: 20%;
  margin-bottom: 1rem;
`;

const SkeletonAuthor = styled(SkeletonElement)`
  height: 1rem;
  width: 35%;
  margin-bottom: 0.75rem;
`;

const SkeletonText = styled(SkeletonElement)<{ width?: string }>`
  height: 1rem;
  margin-bottom: 0.5rem;
  width: ${props => props.width || '100%'};
`;

const SkeletonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const SkeletonActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const SkeletonButton = styled(SkeletonElement)`
  height: 2rem;
  width: 6rem;
`;

const NoticeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const NoticeTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const NoticeDate = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
`;

const NoticeAuthor = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
  margin-bottom: 0.75rem;
`;

const NoticePreview = styled.p`
  color: ${({ theme }) => theme.colors?.text || '#333'};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const NoticeActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ActionButton = styled(Link)`
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  margin-left: 0.5rem;
  transition: all 0.2s ease;
  z-index: 1;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryLight || '#EEF1FD'};
  }
`;

const DeleteButton = styled.button`
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.error || '#e74c3c'};
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors?.error || '#e74c3c'};
  margin-left: 0.5rem;
  transition: all 0.2s ease;
  z-index: 1;
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: #fef0f0;
  }
`;

const AdminActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: white;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || '#4B6ED3'};
  }

  &:before {
    content: '+';
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const ModalText = styled.p`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.background || '#f5f5f5'};
  }
`;

const ConfirmDeleteButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: white;
  background-color: ${({ theme }) => theme.colors?.error || '#e74c3c'};
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #c0392b;
  }
`;

const NoNotices = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors?.error || '#e74c3c'};
  background-color: #fef0f0;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  text-align: center;
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<number | null>(null);

  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const data = await NoticeService.getNotices(isAdmin);
        setNotices(data);
        setError(null);
      } catch (err) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [isAdmin]);

  const handleNoticeClick = (noticeId: number) => {
    navigate(`/notices/${noticeId}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteClick = (e: React.MouseEvent, noticeId: number) => {
    e.stopPropagation();
    setNoticeToDelete(noticeId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (noticeToDelete === null) return;

    try {
      await NoticeService.deleteNotice(noticeToDelete);
      setNotices(notices.filter(notice => notice.id !== noticeToDelete));
      setIsDeleteModalOpen(false);
      setNoticeToDelete(null);
    } catch (err) {
      console.error('Error deleting notice:', err);
      setError('공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setNoticeToDelete(null);
  };

  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <SkeletonItem key={`skeleton-${index}`}>
          <SkeletonHeader>
            <SkeletonTitle />
            <SkeletonDate />
          </SkeletonHeader>
          <SkeletonAuthor />
          <SkeletonText width='95%' />
          <SkeletonText width='90%' />
          <SkeletonText width='85%' />
          {isAdmin && (
            <SkeletonActions>
              <SkeletonButton />
            </SkeletonActions>
          )}
        </SkeletonItem>
      ));
  };

  if (loading) {
    return (
      <>
        <NoticesContainer>
          <PageTitle>공지사항</PageTitle>

          {isAdmin && (
            <AdminActions>
              <CreateButton to='/notices/new'>새 공지사항 작성</CreateButton>
            </AdminActions>
          )}

          <NoticesList>{renderSkeletons()}</NoticesList>
        </NoticesContainer>
      </>
    );
  }

  return (
    <>
      <NoticesContainer>
        <PageTitle>공지사항</PageTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isAdmin && (
          <AdminActions>
            <CreateButton to='/notices/new'>새 공지사항 작성</CreateButton>
          </AdminActions>
        )}

        <NoticesList>
          {notices.length === 0 ? (
            <NoNotices>
              <p>등록된 공지사항이 없습니다.</p>
            </NoNotices>
          ) : (
            notices.map(notice => (
              <NoticeItem key={notice.id} onClick={() => handleNoticeClick(notice.id)}>
                <NoticeHeader>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                  <NoticeDate>{formatDate(notice.createdAt)}</NoticeDate>
                </NoticeHeader>

                {notice.author && <NoticeAuthor>작성자: {notice.author.nickname}</NoticeAuthor>}

                <NoticePreview>{notice.content}</NoticePreview>

                <NoticeActions>
                  {isAdmin && (
                    <>
                      <ActionButton to={`/notices/${notice.id}/edit`} onClick={handleButtonClick}>
                        수정
                      </ActionButton>
                      <DeleteButton onClick={e => handleDeleteClick(e, notice.id)}>
                        삭제
                      </DeleteButton>
                    </>
                  )}
                </NoticeActions>
              </NoticeItem>
            ))
          )}
        </NoticesList>
        <div
          style={{
            marginBottom: 'clamp(450px, 30vw, 650px)',
            width: '100%',
          }}
        />
      </NoticesContainer>

      {isDeleteModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>공지사항 삭제</ModalTitle>
            <ModalText>정말로 이 공지사항을 삭제하시겠습니까?</ModalText>
            <ModalButtons>
              <CancelButton onClick={handleCancelDelete}>취소</CancelButton>
              <ConfirmDeleteButton onClick={handleConfirmDelete}>삭제</ConfirmDeleteButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};
