import React from 'react';
import styled from 'styled-components';

import { useTheme } from '@/app/context/useTheme';

const Container = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const Card = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 18px;
`;

const Title = styled.h2`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.88rem;
`;

const OptionGrid = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button<{ $active: boolean }>`
  min-height: 62px;
  border-radius: 10px;
  text-align: left;
  padding: 12px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primaryLight : theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionTitle = styled.span`
  font-size: 0.89rem;
  font-weight: 700;
`;

const OptionMeta = styled.span`
  font-size: 0.77rem;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

export const SettingsPage: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <Container>
      <Card>
        <Title>테마 설정</Title>
        <Description>다크모드와 라이트모드를 이곳에서 전환합니다.</Description>
        <OptionGrid>
          <OptionButton
            $active={themeMode === 'dark'}
            type='button'
            onClick={() => setThemeMode('dark')}
          >
            <OptionTitle>다크 모드</OptionTitle>
            <OptionMeta>밀도 높은 대시보드 기본 스타일</OptionMeta>
          </OptionButton>
          <OptionButton
            $active={themeMode === 'light'}
            type='button'
            onClick={() => setThemeMode('light')}
          >
            <OptionTitle>라이트 모드</OptionTitle>
            <OptionMeta>밝은 배경의 작업 환경</OptionMeta>
          </OptionButton>
        </OptionGrid>
      </Card>
    </Container>
  );
};
