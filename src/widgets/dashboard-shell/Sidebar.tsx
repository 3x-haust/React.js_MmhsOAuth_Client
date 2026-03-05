import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { NavigationItem } from './types';

type SidebarProps = {
  items: NavigationItem[];
  pathname: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onNavigate?: () => void;
  compact?: boolean;
};

const SidebarContainer = styled.aside<{ $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? '100%' : '248px')};
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: ${({ $compact }) => ($compact ? '16px' : '20px 16px')};
`;

const Brand = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.06rem;
  letter-spacing: 0.04em;
  font-weight: 700;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 18px;
`;

const MenuGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MenuLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.secondaryText)};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceElevated : 'transparent'};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.cardBorder : 'transparent')};
  border-radius: 10px;
  padding: 11px 12px;
  font-size: 0.92rem;
  font-weight: 500;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.surfaceElevated};
    border-color: ${({ theme }) => theme.colors.cardBorder};
  }
`;

const Dot = styled.span<{ $active: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
`;

const isActivePath = (pathname: string, to: string): boolean => {
  if (to === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(to);
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  pathname,
  isLoggedIn,
  isAdmin,
  onNavigate,
  compact,
}) => {
  const visibleItems = items.filter(item => {
    if (item.requiresAuth && !isLoggedIn) {
      return false;
    }
    if (item.requiresAdmin && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <SidebarContainer $compact={compact}>
      <Brand to='/oauth/manage' onClick={onNavigate}>
        MMHS OAuth
      </Brand>

      <MenuGroup>
        {visibleItems.map(item => {
          const active = isActivePath(pathname, item.to);
          return (
            <MenuLink key={item.id} to={item.to} $active={active} onClick={onNavigate}>
              <span>{item.label}</span>
              <Dot $active={active} />
            </MenuLink>
          );
        })}
      </MenuGroup>
    </SidebarContainer>
  );
};
