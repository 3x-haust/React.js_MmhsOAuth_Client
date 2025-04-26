import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors?.text || '#333'};
  color: white;
  padding: 50px 0 30px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
  }
`;

const FooterSection = styled.div``;

const FooterLogo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: white;
`;

const FooterDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const FooterHeading = styled.h4`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 20px;
  font-weight: 600;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 12px;
  
  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 0.2s;
    font-size: 0.95rem;
    
    &:hover {
      color: white;
    }
  }
`;

const FooterDivider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 30px 0;
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const Copyright = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const SocialIcon = styled.a`
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
`;

export const Footer: React.FC = () => {
  return (
    <>
      <div 
          style={{ 
            marginTop: 'clamp(380px, 30vw, 400px)',
            width: '100%'
          }}
        />
      <FooterContainer>
        <FooterContent>
          <FooterSection>
            <FooterLogo>미림 OAuth</FooterLogo>
            <FooterDescription>
              미림마이스터고 학생 및 교사들을 위한 표준 인증 서비스입니다.
              안전하고 편리한 사용자 인증 시스템으로 여러분의 서비스를 더욱 발전시켜 보세요.
            </FooterDescription>
          </FooterSection>
          
          <FooterSection>
            <FooterHeading>바로가기</FooterHeading>
            <FooterLinks>
              <FooterLink>
                <a href="/docs">개발 문서</a>
              </FooterLink>
              <FooterLink>
                <a href="/oauth/manage">앱 관리</a>
              </FooterLink>
              <FooterLink>
                <a href="https://github.com/e-mirim/oauth-full-stack" target="_blank" rel="noopener noreferrer">깃허브</a>
              </FooterLink>
            </FooterLinks>
          </FooterSection>
          
          <FooterSection>
            <FooterHeading>도움말</FooterHeading>
            <FooterLinks>
              <FooterLink>
                <a href="/docs#faq">자주 묻는 질문</a>
              </FooterLink>
              <FooterLink>
                <a href="mailto:mmhs.service@gmail.com">메일 문의하기</a>
                <a href="https://instagram.com/hyphen_team">인스타 문의하기</a>
              </FooterLink>
              <FooterLink>
                <a href="https://e-mirim.hs.kr" target="_blank" rel="noopener noreferrer">미림마이스터고</a>
              </FooterLink>
            </FooterLinks>
          </FooterSection>
        </FooterContent>
        
        <FooterDivider />
        
        <FooterBottom>
          <Copyright>© {new Date().getFullYear()} 미림마이스터고 OAuth 서비스. | Hyphen All rights reserved.</Copyright>
          <SocialLinks>
            <SocialIcon href="https://github.com/3x-haust/React.js_MmhsOAuth_Client" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i className="ri-github-fill"></i> GitHub
            </SocialIcon>
          </SocialLinks>
        </FooterBottom>
      </FooterContainer>
    </>
  );
};