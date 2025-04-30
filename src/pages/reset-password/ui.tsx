import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { theme } from '@/app/styles/index';
import { verifyResetToken, resetPasswordWithToken } from '@/features/auth/api';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.primary};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px rgba(94, 129, 244, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.primaryDark};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface MessageProps {
  $type: 'error' | 'success' | 'info';
}

const Message = styled.div<MessageProps>`
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1rem;
  background-color: ${props => {
    switch (props.$type) {
      case 'error':
        return '#ffebee';
      case 'success':
        return '#e8f5e9';
      case 'info':
        return '#e3f2fd';
      default:
        return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'error':
        return '#c62828';
      case 'success':
        return '#2e7d32';
      case 'info':
        return '#1565c0';
      default:
        return '#1565c0';
    }
  }};
  border: 1px solid
    ${props => {
      switch (props.$type) {
        case 'error':
          return '#ef9a9a';
        case 'success':
          return '#a5d6a7';
        case 'info':
          return '#90caf9';
        default:
          return '#90caf9';
      }
    }};
`;

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setMessage({ text: '유효하지 않은 비밀번호 재설정 링크입니다.', type: 'error' });
        setIsLoading(false);
        return;
      }

      try {
        await verifyResetToken(token);
        setIsTokenValid(true);
      } catch (error) {
        if (error instanceof Error) {
          setMessage({ text: error.message, type: 'error' });
        } else {
          setMessage({ text: '유효하지 않거나 만료된 비밀번호 재설정 링크입니다.', type: 'error' });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [token]);

  useEffect(() => {
    if (newPassword.length >= 8 && newPassword === confirmPassword) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !isTokenValid || !isValid) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await resetPasswordWithToken(token, newPassword);
      setMessage({
        text: '비밀번호가 성공적으로 변경되었습니다. 몇 초 후 로그인 페이지로 이동합니다.',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: '비밀번호 재설정 중 오류가 발생했습니다.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleRequestNewReset = () => {
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>비밀번호 재설정 - 미림마이스터고 OAuth</title>
      </Helmet>
      <PageContainer>
        <ContentWrapper>
          <Title>비밀번호 재설정</Title>

          {message && <Message $type={message.type}>{message.text}</Message>}

          {isLoading ? (
            <div style={{ textAlign: 'center' }}>로딩중...</div>
          ) : isTokenValid ? (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor='new-password'>새 비밀번호</Label>
                <Input
                  id='new-password'
                  type='password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder='새 비밀번호 (8자 이상)'
                  required
                  minLength={8}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor='confirm-password'>비밀번호 확인</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder='비밀번호 확인'
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <span style={{ color: 'red', fontSize: '0.8rem' }}>
                    비밀번호가 일치하지 않습니다.
                  </span>
                )}
              </FormGroup>

              <Button type='submit' disabled={!isValid || isLoading}>
                {isLoading ? '처리중...' : '비밀번호 변경하기'}
              </Button>
            </Form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button onClick={handleRequestNewReset}>비밀번호 재설정 다시 요청하기</Button>
              <Button
                onClick={handleGoToLogin}
                style={{ backgroundColor: '#f5f5f5', color: theme.primary }}
              >
                로그인 페이지로 이동
              </Button>
            </div>
          )}
        </ContentWrapper>
      </PageContainer>
    </>
  );
};
