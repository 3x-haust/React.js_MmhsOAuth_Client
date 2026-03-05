import React from 'react';
import styled from 'styled-components';

import { Sidebar } from './Sidebar';
import { NavigationItem } from './types';

type MobileDrawerProps = {
  open: boolean;
  pathname: string;
  items: NavigationItem[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  onClose: () => void;
};

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(2, 6, 12, 0.56);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 0.2s ease;
  z-index: 40;

  @media (min-width: 1025px) {
    display: none;
  }
`;

const Drawer = styled.div<{ $open: boolean }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: min(86vw, 280px);
  transform: translateX(${({ $open }) => ($open ? '0' : '-102%')});
  transition: transform 0.2s ease;
  height: 100%;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32);
`;

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  pathname,
  items,
  isLoggedIn,
  isAdmin,
  onClose,
}) => {
  return (
    <Overlay $open={open} onClick={onClose}>
      <Drawer
        $open={open}
        onClick={event => {
          event.stopPropagation();
        }}
      >
        <Sidebar
          compact
          pathname={pathname}
          items={items}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onNavigate={onClose}
        />
      </Drawer>
    </Overlay>
  );
};
