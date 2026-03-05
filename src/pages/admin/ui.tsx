import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';

const Container = styled.div`
  max-width: 1080px;
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

const Title = styled.h1`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.86rem;
`;

const Cards = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

const Card = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 18px;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.45rem;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.primary};
`;

const CardDescription = styled.p`
  color: ${({ theme }) => theme.colors.secondaryText};
  margin-bottom: 14px;
  font-size: 0.92rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  font-size: 0.96rem;
`;

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  const adminPages = [
    {
      title: '사용자 관리',
      description: '사용자 계정 정보를 관리하고 수정합니다.',
      link: '/admin/users',
    },
  ];

  return (
    <Container>
      <Header>
        <Title>관리자 대시보드</Title>
        <Description>관리자 권한 작업을 이곳에서 수행합니다.</Description>
      </Header>

      <Cards>
        {adminPages.map(page => (
          <Card key={page.link} type='button' onClick={() => navigate(page.link)}>
            <CardTitle>{page.title}</CardTitle>
            <CardDescription>{page.description}</CardDescription>
            <CardFooter>관리하기 →</CardFooter>
          </Card>
        ))}
      </Cards>
    </Container>
  );
}

export default AdminDashboardPage;
