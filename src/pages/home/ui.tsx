import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../../features/auth";
import { AuthModalWrapper } from "../../widgets";

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 60px 0;

  @media (min-width: 768px) {
    margin: 80px 0;
  }
`;

const Headline = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors?.text || '#333'};

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const Subheadline = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
  max-width: 700px;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;

  @media (min-width: 576px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const Button = styled.button`
  padding: 14px 28px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: white;
  border: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || '#4B6ED3'};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  border: 2px solid ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryLight || '#EEF1FD'};
  }
`;

export const HomePage = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/oauth/manage');
    } else {
      navigate('/login');
    }
  };

  const handleViewDocs = () => {
    navigate('/docs');
  };

  return (
    <>
      <HomeContainer>
        <HeroSection>
          <Headline>미림마이스터고 OAuth 서비스</Headline>
          <Subheadline>
            미림마이스터고 학생 및 교사들의 안전한 인증 시스템을 위한 OAuth 서비스입니다.
          </Subheadline>
          <ButtonGroup>
            <PrimaryButton onClick={handleGetStarted}>
              {isLoggedIn ? 'OAuth 앱 관리' : '시작하기'}
            </PrimaryButton>
            <SecondaryButton onClick={handleViewDocs}>문서 보기</SecondaryButton>
          </ButtonGroup>
        </HeroSection>
      </HomeContainer>
      
      <AuthModalWrapper />
    </>
  );
};