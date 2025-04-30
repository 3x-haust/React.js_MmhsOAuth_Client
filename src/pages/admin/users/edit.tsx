import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getUserById, updateUser } from '@/features/admin/api/userAdmin';
import { useAuthStore } from '@/features/auth';
import { User } from '@/features/auth/hooks';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.primary};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  background-color: ${props =>
    props.variant === 'primary'
      ? props.theme.colors.primary
      : props.variant === 'danger'
        ? '#dc3545'
        : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;

  &:hover {
    background-color: ${props =>
      props.variant === 'primary' ? '#0b5ed7' : props.variant === 'danger' ? '#bd2130' : '#5a6268'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 30px;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #d4edda;
  border-radius: 4px;
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
        const response = await getUserById(parseInt(id));

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setUserData(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setUserData(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: checked };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData || !id) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await updateUser(parseInt(id), userData);

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

  const handleBack = () => {
    navigate('/admin/users');
  };

  if (loading && !userData)
    return (
      <Container>
        <p>로딩 중...</p>
      </Container>
    );
  if (error && !userData)
    return (
      <Container>
        <p>오류: {error}</p>
      </Container>
    );
  if (!userData)
    return (
      <Container>
        <p>사용자 정보를 찾을 수 없습니다.</p>
      </Container>
    );

  return (
    <Container>
      <Title>사용자 정보 수정</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <form onSubmit={handleSubmit}>
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

        <FormGroup>
          <Label>
            <Checkbox
              type='checkbox'
              name='isGraduated'
              checked={userData.isGraduated || false}
              onChange={handleCheckboxChange}
            />
            졸업 여부
          </Label>
        </FormGroup>

        <FormGroup>
          <Label>
            <Checkbox
              type='checkbox'
              name='isAdmin'
              checked={userData.isAdmin || false}
              onChange={handleCheckboxChange}
            />
            관리자 권한
          </Label>
        </FormGroup>

        <ButtonGroup>
          <Button variant='primary' type='submit'>
            저장
          </Button>
          <Button variant='secondary' type='button' onClick={handleBack}>
            취소
          </Button>
        </ButtonGroup>
      </form>
    </Container>
  );
}

export default UserEditPage;
