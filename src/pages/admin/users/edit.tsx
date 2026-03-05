import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getUserById, updateUser } from '@/features/admin/api/userAdmin';
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

const FormCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

const Form = styled.form`
  display: grid;
  gap: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const FormGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.84rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  min-height: 38px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  padding: 0 12px;
  font-size: 0.86rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const Select = styled.select`
  width: 100%;
  min-height: 38px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  padding: 0 12px;
  font-size: 0.86rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 2px;
`;

const CheckboxRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.84rem;
  font-weight: 600;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const Message = styled.div<{ $type: 'error' | 'success' }>`
  border: 1px solid
    ${({ theme, $type }) => ($type === 'error' ? theme.colors.error : theme.colors.success)};
  border-radius: 10px;
  background: ${({ theme, $type }) =>
    $type === 'error' ? theme.colors.errorLight : theme.colors.successLight};
  color: ${({ theme, $type }) => ($type === 'error' ? theme.colors.error : theme.colors.success)};
  padding: 11px 12px;
  font-size: 0.83rem;
`;

const ButtonGroup = styled.div`
  margin-top: 2px;
  display: flex;
  gap: 8px;
  justify-content: flex-start;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  min-height: 36px;
  border-radius: 9px;
  padding: 0 14px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.primaryDark : theme.colors.border};
  background: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.surfaceElevated};
  color: ${({ theme, $variant }) => ($variant === 'primary' ? '#ffffff' : theme.colors.text)};

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.primaryDark : theme.colors.background};
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

export function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getUserById(parseInt(id, 10));

        if (response.status === 200 && response.data) {
          setUserData(response.data as User);
        } else {
          setError(response.message || '사용자 정보를 불러오는데 실패했습니다.');
        }
      } catch {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setUserData(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setUserData(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: checked };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userData || !id) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await updateUser(parseInt(id, 10), userData);

      if (response.status === 200) {
        setSuccess('사용자 정보가 성공적으로 업데이트되었습니다.');
        if (response.data) {
          setUserData(response.data as User);
        }
      } else {
        setError(response.message || '사용자 정보 업데이트에 실패했습니다.');
      }
    } catch {
      setError('사용자 정보 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <Container>
        <MessageCard>사용자 정보를 불러오는 중입니다.</MessageCard>
      </Container>
    );
  }

  if (error && !userData) {
    return (
      <Container>
        <MessageCard $error>오류: {error}</MessageCard>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container>
        <MessageCard $error>사용자 정보를 찾을 수 없습니다.</MessageCard>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderCard>
        <Title>사용자 정보 수정</Title>
        <Description>관리자 권한으로 사용자 정보를 수정합니다.</Description>
      </HeaderCard>

      <FormCard>
        {error && <Message $type='error'>{error}</Message>}
        {success && <Message $type='success'>{success}</Message>}

        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor='email'>이메일</Label>
              <Input
                type='email'
                id='email'
                name='email'
                value={userData.email}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor='nickname'>닉네임</Label>
              <Input
                type='text'
                id='nickname'
                name='nickname'
                value={userData.nickname}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor='role'>역할</Label>
              <Select id='role' name='role' value={userData.role} onChange={handleInputChange}>
                <option value='student'>학생</option>
                <option value='teacher'>교사</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor='major'>전공</Label>
              <Select id='major' name='major' value={userData.major} onChange={handleInputChange}>
                <option value='software'>소프트웨어</option>
                <option value='design'>디자인</option>
                <option value='web'>웹</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor='admission'>입학년도</Label>
              <Input
                type='number'
                id='admission'
                name='admission'
                value={userData.admission || ''}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor='generation'>기수</Label>
              <Input
                type='number'
                id='generation'
                name='generation'
                value={userData.generation || ''}
                onChange={handleInputChange}
              />
            </FormGroup>
          </FormGrid>

          <CheckboxGroup>
            <CheckboxRow>
              <Checkbox
                type='checkbox'
                name='isGraduated'
                checked={userData.isGraduated || false}
                onChange={handleCheckboxChange}
              />
              졸업 여부
            </CheckboxRow>
            <CheckboxRow>
              <Checkbox
                type='checkbox'
                name='isAdmin'
                checked={userData.isAdmin || false}
                onChange={handleCheckboxChange}
              />
              관리자 권한
            </CheckboxRow>
          </CheckboxGroup>

          <ButtonGroup>
            <Button type='submit' $variant='primary'>
              저장
            </Button>
            <Button type='button' $variant='secondary' onClick={() => navigate('/admin/users')}>
              취소
            </Button>
          </ButtonGroup>
        </Form>
      </FormCard>
    </Container>
  );
}

export default UserEditPage;
