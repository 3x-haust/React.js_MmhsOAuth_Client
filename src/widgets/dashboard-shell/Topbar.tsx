import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { API_URL } from '@/shared/api/constants';

type TopbarProps = {
  title: string;
  subtitle: string;
  onMenuOpen: () => void;
};

const TopbarContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 1rem;

  @media (max-width: 1024px) {
    display: inline-flex;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 1rem;
  line-height: 1.2;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.78rem;
  line-height: 1.2;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProfileWrap = styled.div`
  position: relative;
`;

const ProfileButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 0.73rem;
  font-weight: 700;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 188px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.24);
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DropdownTitle = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 700;
`;

const DropdownMeta = styled.p`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.73rem;
`;

const DropdownItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  min-height: 36px;
  padding: 0 12px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.error : theme.colors.text)};
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  font-size: 0.82rem;
  font-weight: 600;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceElevated};
  }
`;

const AvatarFallback = styled.span`
  font-size: 0.85rem;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const resolveProfileImageUrl = (profileImageUrl?: string | null): string | null => {
  if (!profileImageUrl) return null;
  if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
    return profileImageUrl;
  }
  if (profileImageUrl.startsWith('/')) {
    return `${API_URL}${profileImageUrl}`;
  }
  return `${API_URL}/${profileImageUrl}`;
};

const getAvatarText = (nickname?: string): string => {
  if (!nickname) return 'G';
  const trimmed = nickname.trim();
  if (!trimmed) return 'G';
  return trimmed.slice(0, 1).toUpperCase();
};

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, onMenuOpen }) => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, setIsAuthModalOpen, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileImageUrl = resolveProfileImageUrl(user?.profileImageUrl);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <TopbarContainer>
      <Left>
        <MenuButton type='button' onClick={onMenuOpen} aria-label='메뉴 열기'>
          ☰
        </MenuButton>
        <TitleGroup>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </TitleGroup>
      </Left>

      <Right>
        <ProfileWrap ref={menuRef}>
          <ProfileButton
            type='button'
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label='프로필 메뉴'
          >
            {isLoggedIn && profileImageUrl ? (
              <AvatarImage src={profileImageUrl} alt='프로필 이미지' />
            ) : isLoggedIn ? (
              <span>{getAvatarText(user?.nickname)}</span>
            ) : (
              <AvatarFallback>•</AvatarFallback>
            )}
          </ProfileButton>

          {menuOpen && (
            <Dropdown>
              <DropdownHeader>
                <DropdownTitle>{isLoggedIn ? user?.nickname || '사용자' : '게스트'}</DropdownTitle>
                <DropdownMeta>{isLoggedIn ? '로그인됨' : '로그인 필요'}</DropdownMeta>
              </DropdownHeader>

              <DropdownItem
                type='button'
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
              >
                설정
              </DropdownItem>

              {isLoggedIn ? (
                <>
                  <DropdownItem
                    type='button'
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    마이페이지
                  </DropdownItem>
                  <DropdownItem
                    type='button'
                    $danger
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                  >
                    로그아웃
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem
                  type='button'
                  onClick={() => {
                    setMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                >
                  로그인
                </DropdownItem>
              )}
            </Dropdown>
          )}
        </ProfileWrap>
      </Right>
    </TopbarContainer>
  );
};
