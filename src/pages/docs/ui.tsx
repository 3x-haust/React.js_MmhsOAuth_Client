import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { DeveloperDoc, DeveloperDocService } from '@/features/developer-doc';

const Container = styled.div`
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

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.04rem;
`;

const Description = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.85rem;
`;

const UploadButton = styled.button`
  margin-top: 12px;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-size: 0.82rem;
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
  font-size: 0.96rem;
  font-weight: 700;
  text-align: left;
`;

const ItemMeta = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.79rem;
`;

const Preview = styled.p`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.84rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemActions = styled.div`
  margin-top: 12px;
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

const getPreview = (content: string): string => {
  const stripped = content
    .replace(/[#*_`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= 180) return stripped;
  return `${stripped.slice(0, 180)}...`;
};

export const DocsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [list, setList] = useState<DeveloperDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const docs = await DeveloperDocService.getDocs(Boolean(user?.isAdmin));
        setList(docs);
      } catch (loadError) {
        console.error(loadError);
        setError('개발 문서를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.isAdmin]);

  return (
    <Container>
      <HeaderCard>
        <Title>개발 문서</Title>
        <Description>공지사항과 분리된 개발자 전용 문서 피드입니다.</Description>
        {user?.isAdmin && (
          <UploadButton type='button' onClick={() => navigate('/docs/new')}>
            문서 업로드
          </UploadButton>
        )}
      </HeaderCard>

      <List>
        {loading && <Empty>문서를 불러오는 중입니다.</Empty>}
        {error && <Empty>{error}</Empty>}
        {!loading && !error && list.length === 0 && <Empty>등록된 문서가 없습니다.</Empty>}
        {!loading &&
          !error &&
          list.map(item => (
            <Item key={item.id}>
              <ItemTitle type='button' onClick={() => navigate(`/docs/${item.id}`)}>
                {item.title}
              </ItemTitle>
              <ItemMeta>
                {formatDate(item.createdAt)}
                {item.author ? ` · ${item.author.nickname}` : ''}
              </ItemMeta>
              <Preview>{getPreview(item.content)}</Preview>

              {user?.isAdmin && (
                <ItemActions>
                  <ActionButton type='button' onClick={() => navigate(`/docs/${item.id}`)}>
                    보기
                  </ActionButton>
                  <ActionButton type='button' onClick={() => navigate(`/docs/${item.id}/edit`)}>
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
