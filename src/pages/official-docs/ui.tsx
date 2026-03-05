import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { Notice, NoticeService } from '@/features/notice/api/noticeService';

const Container = styled.div`
  max-width: 980px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const Header = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

const HeaderTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.02rem;
`;

const HeaderMeta = styled.p`
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.84rem;
`;

const UploadButton = styled.button`
  margin-top: 12px;
  min-height: 38px;
  border-radius: 10px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-size: 0.83rem;
  font-weight: 700;
`;

const List = styled.ul`
  display: grid;
  gap: 10px;
`;

const Item = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px;
`;

const ItemTitle = styled.button`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  font-weight: 700;
  text-align: left;
`;

const ItemMeta = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.79rem;
`;

const ItemActions = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  min-height: 32px;
  padding: 0 10px;
  font-size: 0.78rem;
  font-weight: 600;
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.84rem;
`;

const formatDate = (value: string): string => {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const OfficialDocsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [list, setList] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const notices = await NoticeService.getNotices(Boolean(user?.isAdmin));
        setList(notices);
      } catch (loadError) {
        console.error(loadError);
        setError('문서를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.isAdmin]);

  return (
    <Container>
      <Header>
        <HeaderTitle>MMHS OAuth 공식 문서</HeaderTitle>
        <HeaderMeta>업로드형 문서 피드입니다. 문서는 최신순으로 정렬됩니다.</HeaderMeta>
        {user?.isAdmin && (
          <UploadButton type='button' onClick={() => navigate('/notices/new')}>
            문서 업로드
          </UploadButton>
        )}
      </Header>

      <List>
        {loading && <Empty>문서를 불러오는 중입니다.</Empty>}
        {error && <Empty>{error}</Empty>}
        {!loading && !error && list.length === 0 && <Empty>등록된 문서가 없습니다.</Empty>}
        {!loading &&
          !error &&
          list.map(item => (
            <Item key={item.id}>
              <ItemTitle type='button' onClick={() => navigate(`/notices/${item.id}`)}>
                {item.title}
              </ItemTitle>
              <ItemMeta>{formatDate(item.createdAt)}</ItemMeta>
              {user?.isAdmin && (
                <ItemActions>
                  <ActionButton type='button' onClick={() => navigate(`/notices/${item.id}`)}>
                    보기
                  </ActionButton>
                  <ActionButton type='button' onClick={() => navigate(`/notices/${item.id}/edit`)}>
                    수정
                  </ActionButton>
                </ItemActions>
              )}
            </Item>
          ))}
      </List>
    </Container>
  );
};
