import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  min-height: 60vh;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorCode = styled.h1`
  font-size: 9rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  line-height: 1;
  position: relative;
  opacity: 0;
  animation: ${fadeIn} 0.6s ease-out 0.2s forwards;

  &::after {
    content: '404';
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    opacity: 0.1;
    color: ${({ theme }) => theme.colors.text};
    z-index: -1;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  margin: 1rem 0;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0;
  animation: ${fadeIn} 0.6s ease-out 0.4s forwards;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.secondaryText};
  margin-bottom: 2rem;
  opacity: 0;
  animation: ${fadeIn} 0.6s ease-out 0.6s forwards;
`;

const HomeButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  opacity: 0;
  animation: ${fadeIn} 0.6s ease-out 1s forwards;

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  }
`;

const Illustration = styled.div`
  margin: 2rem 0;
  font-size: 5rem;
  opacity: 0;
  animation:
    ${fadeIn} 0.6s ease-out 0.8s forwards,
    ${bounce} 2s ease-in-out 1.4s infinite;
`;

const RecentVisited = styled.div`
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  opacity: 0;
  animation: ${fadeIn} 0.6s ease-out 1.2s forwards;
`;

const RecentTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
`;

const RecentLink = styled.div`
  margin: 0.5rem 0;
  padding: 0.8rem 1rem;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.cardBorder};
    animation: ${pulse} 0.5s ease-in-out;
  }
`;

const PageName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const PagePath = styled.span`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.9rem;
`;

interface RecentPage {
  path: string;
  name: string;
}

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  useEffect(() => {
    try {
      const recentVisits = localStorage.getItem('recentPages');
      if (recentVisits) {
        const pages = JSON.parse(recentVisits) as RecentPage[];
        const filtered = pages.filter(page => !page.path.startsWith('/oauth'));
        setRecentPages(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load recent pages:', error);
    }
  }, []);

  const handleRandomEmoji = () => {
    const emojis = ['🔍', '🧩', '🚧', '📋', '🤔', '🔎'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <Title>페이지를 찾을 수 없습니다</Title>
      <Description>
        요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다. URL을 확인하시거나
        아래 버튼을 클릭하여 홈으로 돌아가세요.
      </Description>
      <Illustration>{handleRandomEmoji()}</Illustration>
      <HomeButton onClick={() => navigate('/')}>홈으로 돌아가기</HomeButton>

      {recentPages.length > 0 && (
        <RecentVisited>
          <RecentTitle>최근 방문한 페이지</RecentTitle>
          {recentPages.map((page, index) => (
            <RecentLink key={index} onClick={() => navigate(page.path)}>
              <PageName>{page.name}</PageName>
              <PagePath>{page.path}</PagePath>
            </RecentLink>
          ))}
        </RecentVisited>
      )}
    </NotFoundContainer>
  );
};
