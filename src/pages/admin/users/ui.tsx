import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getAllUsers, deleteUser } from '@/features/admin/api/userAdmin';
import { useAuthStore } from '@/features/auth';
import { User } from '@/features/auth/hooks';

const Container = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const HeaderCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.2rem, 2vw, 1.52rem);
`;

const Description = styled.p`
  margin-top: 7px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.86rem;
`;

const Toolbar = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  width: min(340px, 100%);
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.86rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const CountText = styled.p`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.82rem;
`;

const TableCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 11px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.surfaceElevated};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Td = styled.td`
  padding: 11px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.84rem;
  vertical-align: middle;
`;

const StatusGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const StatusBadge = styled.span<{ $tone: 'admin' | 'active' }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid
    ${({ theme, $tone }) => ($tone === 'admin' ? theme.colors.warning : theme.colors.success)};
  color: ${({ theme, $tone }) => ($tone === 'admin' ? theme.colors.warning : theme.colors.success)};
  background: ${({ theme, $tone }) =>
    $tone === 'admin' ? theme.colors.warningLight : theme.colors.successLight};
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  gap: 6px;
`;

const ActionButton = styled.button<{ $variant: 'edit' | 'delete' }>`
  min-height: 30px;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid
    ${({ theme, $variant }) => ($variant === 'delete' ? theme.colors.error : theme.colors.primary)};
  background: ${({ theme, $variant }) =>
    $variant === 'delete' ? theme.colors.error : theme.colors.primary};
  color: #ffffff;

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'delete' ? theme.colors.errorDark : theme.colors.primaryDark};
  }
`;

const MessageCard = styled.section<{ $error?: boolean }>`
  border: 1px solid
    ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.cardBorder)};
  border-radius: 12px;
  background: ${({ theme, $error }) => ($error ? theme.colors.errorLight : theme.colors.surface)};
  padding: 16px;
  color: ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.secondaryText)};
  font-size: 0.86rem;
`;

const getRoleLabel = (role: User['role']) => (role === 'student' ? '학생' : '교사');

const getMajorLabel = (major: User['major']) => {
  if (major === 'software') return '소프트웨어';
  if (major === 'design') return '디자인';
  if (major === 'web') return '웹';
  return '-';
};

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllUsers();

        if (response.status === 200 && response.data) {
          setUsers(response.data as User[]);
        } else {
          setError(response.message || '사용자 목록을 불러오는데 실패했습니다.');
        }
      } catch {
        setError('사용자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    if (!window.confirm('이 사용자를 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
      return;
    }

    try {
      const response = await deleteUser(userId);
      if (response.status === 200) {
        setUsers(prev => prev.filter(target => target.id !== userId));
        alert('사용자가 삭제되었습니다.');
      } else {
        alert(response.message || '사용자 삭제에 실패했습니다.');
      }
    } catch {
      alert('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(target => {
      const email = target.email.toLowerCase();
      const nickname = target.nickname.toLowerCase();
      return email.includes(keyword) || nickname.includes(keyword);
    });
  }, [searchTerm, users]);

  if (loading) {
    return (
      <Container>
        <MessageCard>사용자 목록을 불러오는 중입니다.</MessageCard>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <MessageCard $error>오류: {error}</MessageCard>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderCard>
        <Title>사용자 관리</Title>
        <Description>사용자 계정 목록 조회 및 권한 관리</Description>
        <Toolbar>
          <SearchInput
            type='text'
            placeholder='이메일 또는 닉네임으로 검색'
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
          <CountText>총 {filteredUsers.length}명</CountText>
        </Toolbar>
      </HeaderCard>

      <TableCard>
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>이메일</Th>
                <Th>닉네임</Th>
                <Th>역할</Th>
                <Th>전공</Th>
                <Th>입학년도</Th>
                <Th>상태</Th>
                <Th>관리</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(target => (
                <Tr key={target.id}>
                  <Td>{target.id}</Td>
                  <Td>{target.email}</Td>
                  <Td>{target.nickname}</Td>
                  <Td>{getRoleLabel(target.role)}</Td>
                  <Td>{getMajorLabel(target.major)}</Td>
                  <Td>{target.admission || '-'}</Td>
                  <Td>
                    <StatusGroup>
                      {target.isAdmin && <StatusBadge $tone='admin'>관리자</StatusBadge>}
                      <StatusBadge $tone='active'>활성</StatusBadge>
                    </StatusGroup>
                  </Td>
                  <Td>
                    <ButtonGroup>
                      <ActionButton
                        type='button'
                        $variant='edit'
                        onClick={() => navigate(`/admin/users/${target.id}/edit`)}
                      >
                        수정
                      </ActionButton>
                      <ActionButton
                        type='button'
                        $variant='delete'
                        onClick={() => handleDelete(target.id)}
                      >
                        삭제
                      </ActionButton>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </TableCard>
    </Container>
  );
}

export default UserManagementPage;
