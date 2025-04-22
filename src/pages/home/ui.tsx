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

// const SecondaryButton = styled(Button)`
//   background-color: transparent;
//   border: 2px solid ${({ theme }) => theme.colors?.primary || '#5E81F4'};
//   color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};

//   &:hover {
//     background-color: ${({ theme }) => theme.colors?.primaryLight || '#EEF1FD'};
//   }
// `;

const FeaturesSection = styled.section`
  padding: 60px 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 50px;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${({ theme }) => theme.colors?.primaryLight || '#EEF1FD'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  font-size: 24px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
  line-height: 1.6;
`;

const HowItWorksSection = styled.section`
  padding: 60px 0;
  background-color: ${({ theme }) => theme.colors?.background || '#f5f5f5'};
  margin: 40px -20px;
  padding: 60px 20px;

  @media (min-width: 768px) {
    margin: 60px -20px;
  }
`;

const StepsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Step = styled.div`
  display: flex;
  margin-bottom: 40px;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 15px;
  flex-shrink: 0;

  @media (min-width: 768px) {
    margin-right: 25px;
    margin-bottom: 0;
  }
`;

const StepContent = styled.div``;

const StepTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
  line-height: 1.6;
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

  // const handleViewDocs = () => {
  //   navigate('/docs');
  // };

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
            {/* <SecondaryButton onClick={handleViewDocs}>문서 보기</SecondaryButton> */}
          </ButtonGroup>
        </HeroSection>

        <FeaturesSection>
          <SectionTitle>주요 기능</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>🔐</FeatureIcon>
              <FeatureTitle>학교 도메인 인증</FeatureTitle>
              <FeatureDescription>
                @e-mirim.hs.kr 이메일 도메인을 통해 미림마이스터고 구성원임을 인증합니다.
                학교 구성원만 이용할 수 있는 안전한 환경을 제공합니다.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🔄</FeatureIcon>
              <FeatureTitle>통합 로그인</FeatureTitle>
              <FeatureDescription>
                한 번의 로그인으로 여러 서비스를 이용할 수 있는 SSO(Single Sign-On) 기능을 제공합니다.
                반복적인 로그인 과정 없이 편리하게 서비스를 이용하세요.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>👩‍💻</FeatureIcon>
              <FeatureTitle>개발자 친화적</FeatureTitle>
              <FeatureDescription>
                개발자를 위한 직관적인 API와 문서를 제공합니다.
                다양한 애플리케이션에 미림마이스터고 OAuth 서비스를 쉽게 연동할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>

        <HowItWorksSection>
          <SectionTitle>이용 방법</SectionTitle>
          <StepsContainer>
            <Step>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>OAuth 애플리케이션 등록</StepTitle>
                <StepDescription>
                  개발하고자 하는 애플리케이션을 관리 페이지에서 등록합니다.
                  서비스 이름, 도메인, 리다이렉션 URL 등의 정보를 입력하세요.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>클라이언트 ID/시크릿 발급</StepTitle>
                <StepDescription>
                  애플리케이션 등록 후, 클라이언트 ID와 시크릿을 발급받습니다.
                  이 정보는 OAuth 인증 과정에서 사용되므로 안전하게 보관하세요.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>API 연동 및 구현</StepTitle>
                <StepDescription>
                  제공된 문서에 따라 OAuth 인증 흐름을 구현하고, 사용자 정보에 접근하여 서비스에 활용합니다.
                  필요한 권한 범위(스코프)에 따라 적절한 사용자 정보를 요청하세요.
                </StepDescription>
              </StepContent>
            </Step>
          </StepsContainer>
        </HowItWorksSection>

      </HomeContainer>
      <AuthModalWrapper />
    </>
  );
};