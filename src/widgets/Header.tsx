import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../features/auth";

const HeaderContainer = styled.header`
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  a {
    color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
    text-decoration: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  margin: 0 16px;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  }
`;

const LoginButton = styled.button`
  background-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || '#4B6ED3'};
  }
`;

const UserMenu = styled.div`
  position: relative;
  margin-left: 16px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors?.primaryLight || '#EEF1FD'};
  color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 48px;
  right: 0;
  width: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  z-index: 10;
`;

const UserInfo = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  
  h4 {
    margin: 0 0 4px;
    font-size: 16px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
  }
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors?.background || '#f5f5f5'};
  }
`;

export const Header: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getUserInitials = () => {
    if (!user || !user.nickname) return '?';
    
    const nameParts = user.nickname.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.nickname.substring(0, 2).toUpperCase();
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };
  
  return (
    <HeaderContainer>
      <Logo>
        <Link to="/">미림 OAuth</Link>
      </Logo>
      
      <Nav>
        <NavLink to="/docs">문서</NavLink>
        <NavLink to="/notices">공지사항</NavLink>
        
        {isLoggedIn && (
          <NavLink to="/oauth/manage">앱 관리</NavLink>
        )}
        
        {!isLoggedIn ? (
          <LoginButton onClick={() => navigate('/login')}>로그인</LoginButton>
        ) : (
          <UserMenu ref={dropdownRef}>
            <UserAvatar onClick={() => setDropdownOpen(!dropdownOpen)}>
              {getUserInitials()}
            </UserAvatar>
            
            <DropdownMenu isOpen={dropdownOpen}>
              <UserInfo>
                <h4>{user?.nickname || '사용자'}</h4>
                <p>{user?.email || ''}</p>
              </UserInfo>
              
              <MenuItem onClick={() => {
                setDropdownOpen(false);
                navigate('/oauth/manage');
              }}>
                OAuth 앱 관리
              </MenuItem>
              
              <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </DropdownMenu>
          </UserMenu>
        )}
      </Nav>
    </HeaderContainer>
  );
};