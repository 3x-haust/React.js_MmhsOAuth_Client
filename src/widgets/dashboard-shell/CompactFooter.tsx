import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 11px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

const Copy = styled.small`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.78rem;
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.78rem;
  font-weight: 500;
`;

export const CompactFooter: React.FC = () => {
  return (
    <FooterContainer>
      <Copy>© 2026 MMHS OAuth</Copy>
      <Links>
        <Link href='/docs'>문서</Link>
        <Link href='https://github.com/e-mirim/oauth-full-stack' target='_blank' rel='noreferrer'>
          GitHub
        </Link>
      </Links>
    </FooterContainer>
  );
};
