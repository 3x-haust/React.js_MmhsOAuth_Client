import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { User } from '@/features/auth/hooks';
import { getAllUsers, deleteUser } from '@/features/admin/api/userAdmin';
import { useAuthStore } from '@/features/auth';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.primary};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  text-align: left;
  padding: 12px 15px;
`;

const Td = styled.td`
  border-bottom: 1px solid #ddd;
  padding: 12px 15px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  background-color: ${props => props.variant === 'delete' ? '#dc3545' : props.variant === 'edit' ? '#0d6efd' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  margin-right: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.variant === 'delete' ? '#bd2130' : props.variant === 'edit' ? '#0b5ed7' : '#5a6268'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
`;

const StatusBadge = styled.span<{ isAdmin?: boolean; isActive?: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    if (props.isAdmin) return '#9c27b0';
    if (props.isActive) return '#28a745';
    return '#dc3545';
  }};
  color: white;
`;

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
        const response = await getAllUsers();
        
        if (response.status === 200 && response.data) {
          setUsers(response.data as User[]);
        } else {
          setError(response.message);
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
    if (window.confirm('이 사용자를 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
      try {
        const response = await deleteUser(userId);
        if (response.status === 200) {
          setUsers(users.filter(user => user.id !== userId));
          alert('사용자가 삭제되었습니다.');
        } else {
          alert(response.message);
        }
      } catch {
        alert('사용자 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEdit = (userId: number) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  const filteredUsers = users.filter((user) => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Container><p>로딩 중...</p></Container>;
  if (error) return <Container><p>오류: {error}</p></Container>;

  return (
    <Container>
      <Title>사용자 관리</Title>
      
      <FilterContainer>
        <SearchInput 
          type="text" 
          placeholder="이메일 또는 닉네임으로 검색" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FilterContainer>

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
          {filteredUsers.map(user => (
            <Tr key={user.id}>
              <Td>{user.id}</Td>
              <Td>{user.email}</Td>
              <Td>{user.nickname}</Td>
              <Td>{user.role === 'student' ? '학생' : '교사'}</Td>
              <Td>
                {user.major === 'software' ? '소프트웨어' : 
                 user.major === 'design' ? '디자인' : 
                 user.major === 'web' ? '웹' : '-'}
              </Td>
              <Td>{user.admission || '-'}</Td>
              <Td>
                {user.isAdmin && <StatusBadge isAdmin>관리자</StatusBadge>}
                <StatusBadge isActive={true}>활성</StatusBadge>
              </Td>
              <Td>
                <ButtonGroup>
                  <ActionButton variant="edit" onClick={() => handleEdit(user.id)}>
                    수정
                  </ActionButton>
                  <ActionButton variant="delete" onClick={() => handleDelete(user.id)}>
                    삭제
                  </ActionButton>
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default UserManagementPage;