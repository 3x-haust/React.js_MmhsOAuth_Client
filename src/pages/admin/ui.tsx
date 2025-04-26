import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../features/auth';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 24px;
  color: ${props => props.theme.colors.primary};
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h2`
  font-size: 22px;
  margin-bottom: 10px;
  color: ${props => props.theme.colors.primary};
`;

const CardDescription = styled.p`
  color: #666;
  margin-bottom: 15px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
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
      <Title>관리자 대시보드</Title>
      
      <Cards>
        {adminPages.map((page, index) => (
          <Card key={index} onClick={() => navigate(page.link)}>
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