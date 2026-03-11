import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate, Link } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import styled, { keyframes } from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { Notice, NoticeService } from '@/features/notice/api/noticeService';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const DetailContainer = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const DetailCard = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 18px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.22rem, 2vw, 1.56rem);
  line-height: 1.35;
`;

const NoticeInfo = styled.div`
  margin-top: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.82rem;
`;

const NoticeContent = styled.div`
  margin-top: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1rem, 1.2vw, 1.08rem);
  line-height: 1.78;
  overflow-wrap: anywhere;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.35em;
    margin-bottom: 0.45em;
    line-height: 1.3;
    font-weight: 700;
  }

  h1 {
    font-size: 1.42rem;
  }

  h2 {
    font-size: 1.26rem;
  }

  h3 {
    font-size: 1.12rem;
  }

  p {
    margin: 0.74em 0;
  }

  ul,
  ol {
    margin: 0.75em 0;
    padding-left: 1.34em;
  }

  li + li {
    margin-top: 0.25em;
  }

  blockquote {
    margin: 0.95em 0;
    padding: 0.62em 0.9em;
    border-left: 3px solid ${({ theme }) => theme.colors.primaryDark};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.secondaryText};
    border-radius: 8px;
  }

  hr {
    margin: 1.12em 0;
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }

  code {
    font-family: 'SFMono-Regular', 'Menlo', 'Consolas', monospace;
    font-size: 0.84em;
    padding: 0.08em 0.35em;
    border-radius: 6px;
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  pre {
    margin: 0.95em 0;
    padding: 0.84em 0.9em;
    border-radius: 10px;
    overflow: auto;
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }

  pre code {
    padding: 0;
    border: none;
    background: transparent;
    font-size: 0.84rem;
    line-height: 1.6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.95em 0;
    font-size: 0.84rem;
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.48em 0.56em;
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    font-weight: 700;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    margin: 0.8em 0;
  }
`;

const ActionButtons = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const RightButtons = styled.div`
  display: inline-flex;
  gap: 8px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const BaseButton = styled.button`
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 600;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 600;
`;

const EditButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  @media (max-width: 640px) {
    flex: 1;
  }
`;

const DeleteButton = styled(BaseButton)`
  border-color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.error};
  color: #ffffff;

  &:hover {
    background: ${({ theme }) => theme.colors.errorDark};
  }

  @media (max-width: 640px) {
    flex: 1;
  }
`;

const LoadingSpinner = styled.div`
  min-height: 260px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
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

const ErrorMessage = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  padding: 12px 14px;
  font-size: 0.84rem;
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
      } catch (fetchError) {
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching notice details:', fetchError);
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
    } catch (deleteError) {
      setError('공지사항을 삭제하는 중 오류가 발생했습니다.');
      console.error('Error deleting notice:', deleteError);
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <DetailContainer>
        <LoadingSpinner />
      </DetailContainer>
    );
  }

  if (!notice) {
    return (
      <DetailContainer>
        <ErrorMessage>공지사항을 찾을 수 없거나 존재하지 않는 공지사항입니다.</ErrorMessage>
        <BackButton to='/notices'>공지사항 목록으로</BackButton>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DetailCard>
        <Title>{notice.title}</Title>

        <NoticeInfo>
          {notice.author ? `작성자: ${notice.author.nickname} · ` : ''}
          {formatDate(notice.createdAt)}
        </NoticeInfo>

        <NoticeContent>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            allowedElements={[
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'p',
              'strong',
              'em',
              'del',
              'blockquote',
              'ul',
              'ol',
              'li',
              'code',
              'pre',
              'hr',
              'br',
              'a',
              'img',
              'table',
              'thead',
              'tbody',
              'tr',
              'th',
              'td',
            ]}
            unwrapDisallowed
          >
            {notice.content}
          </ReactMarkdown>
        </NoticeContent>

        <ActionButtons>
          <BackButton to='/notices'>목록으로 돌아가기</BackButton>

          {isAdmin && (
            <RightButtons>
              <EditButton to={`/notices/${notice.id}/edit`}>수정</EditButton>
              <DeleteButton onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? '처리 중...' : '삭제'}
              </DeleteButton>
            </RightButtons>
          )}
        </ActionButtons>
      </DetailCard>
    </DetailContainer>
  );
};
