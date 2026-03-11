import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { Notice, NoticeService } from '@/features/notice/api/noticeService';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
`;

const NoticesContainer = styled.div`
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
  font-weight: 700;
`;

const PageDescription = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.86rem;
`;

const AdminActions = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-size: 0.84rem;
  font-weight: 700;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ErrorMessage = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.85rem;
`;

const NoticesList = styled.div`
  display: grid;
  gap: 10px;
`;

const NoticeItem = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryDark};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    transform: translateY(-1px);
  }
`;

const SkeletonItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px;
`;

const SkeletonElement = styled.div`
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.skeleton} 25%,
    ${({ theme }) => theme.colors.skeletonHighlight} 50%,
    ${({ theme }) => theme.colors.skeleton} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s infinite linear;
`;

const SkeletonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const SkeletonTitle = styled(SkeletonElement)`
  height: 1.28rem;
  width: 64%;
`;

const SkeletonDate = styled(SkeletonElement)`
  height: 1rem;
  width: 22%;
`;

const SkeletonAuthor = styled(SkeletonElement)`
  margin-top: 10px;
  height: 0.95rem;
  width: 32%;
`;

const SkeletonLine = styled(SkeletonElement)<{ $width?: string }>`
  margin-top: 8px;
  height: 0.95rem;
  width: ${({ $width }) => $width ?? '100%'};
`;

const SkeletonActions = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const SkeletonButton = styled(SkeletonElement)`
  width: 66px;
  height: 32px;
`;

const NoticeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const NoticeTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  line-height: 1.35;
`;

const NoticeDate = styled.span`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.76rem;
  white-space: nowrap;
`;

const NoticeAuthor = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.8rem;
`;

const NoticePreview = styled.p`
  margin-top: 9px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 1rem;
  line-height: 1.72;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const NoticeActions = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.78rem;
  font-weight: 600;

  &:hover {
    border-color: ${({ theme }) => theme.colors.cardBorder};
  }
`;

const DeleteButton = styled.button`
  min-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: transparent;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.78rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.errorLight};
  }
`;

const NoNotices = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 18px;
  text-align: center;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.84rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 16, 0.64);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;

const ModalContent = styled.div`
  width: min(420px, calc(100% - 24px));
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  padding: 18px;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const ModalText = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.85rem;
`;

const ModalButtons = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelButton = styled.button`
  min-height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 600;
`;

const ConfirmDeleteButton = styled.button`
  min-height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.error};
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.errorDark};
  }
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getPreview = (content: string): string => {
  const stripped = content
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped.length <= 170) return stripped;
  return `${stripped.slice(0, 170)}...`;
};

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<number | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const data = await NoticeService.getNotices(isAdmin);
        setNotices(data);
        setError(null);
      } catch (fetchError) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching notices:', fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [isAdmin]);

  const handleNoticeClick = (noticeId: number) => {
    navigate(`/notices/${noticeId}`);
  };

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleDeleteClick = (event: React.MouseEvent, noticeId: number) => {
    event.stopPropagation();
    setNoticeToDelete(noticeId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (noticeToDelete === null) return;

    try {
      await NoticeService.deleteNotice(noticeToDelete);
      setNotices(prev => prev.filter(notice => notice.id !== noticeToDelete));
      setIsDeleteModalOpen(false);
      setNoticeToDelete(null);
    } catch (deleteError) {
      console.error('Error deleting notice:', deleteError);
      setError('공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setNoticeToDelete(null);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <SkeletonItem key={`skeleton-${index}`}>
        <SkeletonHeader>
          <SkeletonTitle />
          <SkeletonDate />
        </SkeletonHeader>
        <SkeletonAuthor />
        <SkeletonLine $width='96%' />
        <SkeletonLine $width='87%' />
        <SkeletonLine $width='73%' />
        {isAdmin && (
          <SkeletonActions>
            <SkeletonButton />
            <SkeletonButton />
          </SkeletonActions>
        )}
      </SkeletonItem>
    ));
  };

  return (
    <>
      <NoticesContainer>
        <HeaderCard>
          <PageTitle>공지사항</PageTitle>
          <PageDescription>서비스 업데이트와 운영 공지를 확인할 수 있습니다.</PageDescription>

          {isAdmin && (
            <AdminActions>
              <CreateButton to='/notices/new'>새 공지사항 작성</CreateButton>
            </AdminActions>
          )}
        </HeaderCard>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <NoticesList>
          {loading && renderSkeletons()}
          {!loading && notices.length === 0 && <NoNotices>등록된 공지사항이 없습니다.</NoNotices>}
          {!loading &&
            notices.map(notice => (
              <NoticeItem key={notice.id} onClick={() => handleNoticeClick(notice.id)}>
                <NoticeHeader>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                  <NoticeDate>{formatDate(notice.createdAt)}</NoticeDate>
                </NoticeHeader>

                {notice.author && <NoticeAuthor>작성자: {notice.author.nickname}</NoticeAuthor>}

                <NoticePreview>{getPreview(notice.content)}</NoticePreview>

                {isAdmin && (
                  <NoticeActions>
                    <ActionButton to={`/notices/${notice.id}/edit`} onClick={handleButtonClick}>
                      수정
                    </ActionButton>
                    <DeleteButton onClick={event => handleDeleteClick(event, notice.id)}>
                      삭제
                    </DeleteButton>
                  </NoticeActions>
                )}
              </NoticeItem>
            ))}
        </NoticesList>
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
