import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { theme } from '@/app/styles/index';
import { useAuthStore } from '@/features/auth';
import {
  logIn,
  sendVerificationCode,
  signUp,
  getUserInfo,
  requestPasswordReset,
  findNickname,
} from '@/features/auth/api/index';

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

const ErrorModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  text-align: center;

  p {
    font-size: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: 2px solid ${theme.primary};
  }
`;

const Button = styled.button<{ $disabled?: boolean }>`
  padding: 0.8rem;
  background-color: ${props => (props.$disabled ? '#ccc' : theme.primary)};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;
`;

const ValidationMessage = styled.small<{ $valid: boolean }>`
  color: ${props => (props.$valid ? theme.primary : 'red')};
  margin-top: -0.5rem;
  text-align: left;
`;

type FormMode = 'login' | 'signup' | 'findNickname' | 'resetPassword';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    code: '',
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorColor, setErrorColor] = useState('red');
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [fieldValidity, setFieldValidity] = useState({
    email: false,
    nickname: false,
    password: false,
    code: false,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect') || '';
  const fullRedirectUrl = redirectUrl
    ? redirectUrl +
      '&response_type=' +
      queryParams.get('response_type') +
      '&state=' +
      queryParams.get('state') +
      '&redirect_uri=' +
      queryParams.get('redirect_uri') +
      '&scope=' +
      queryParams.get('scope')
    : '';

  useEffect(() => {
    setFormData({ email: '', nickname: '', password: '', code: '' });
    setTimeLeft(0);
    setError('');
    setFieldValidity({
      email: false,
      nickname: false,
      password: false,
      code: false,
    });
  }, [formMode]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid = useMemo(() => {
    if (formMode === 'login') {
      return {
        email: true,
        nickname: !!formData.nickname.trim(),
        password: !!formData.password.trim(),
        code: true,
      };
    } else if (formMode === 'signup') {
      return {
        email: formData.email.trim() !== '' && isValidEmail(formData.email),
        nickname: !!formData.nickname.trim(),
        password: formData.password.trim().length >= 8,
        code: !!formData.code.trim(),
      };
    } else if (formMode === 'findNickname') {
      return {
        email: formData.email.trim() !== '' && isValidEmail(formData.email),
        nickname: true,
        password: true,
        code: true,
      };
    } else if (formMode === 'resetPassword') {
      return {
        email: formData.email.trim() !== '' && isValidEmail(formData.email),
        nickname: true,
        password: true,
        code: true,
      };
    }

    return {
      email: false,
      nickname: false,
      password: false,
      code: false,
    };
  }, [formData, formMode]);

  useEffect(() => {
    setFieldValidity(isFormValid);
  }, [isFormValid]);

  const showError = (message: string, color = 'red') => {
    setError(message);
    setShowErrorModal(true);
    setErrorColor(color);
    setTimeout(() => {
      setShowErrorModal(false);
      setError('');
    }, 2000);
  };

  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      showError('이메일을 입력해주세요');
      return;
    }
    try {
      setLoading(true);
      if (formMode === 'signup') {
        await sendVerificationCode(formData.email);
        setTimeLeft(300);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : '요청 처리 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Object.values(isFormValid).every(Boolean)) {
      showError('모든 필드를 올바르게 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      if (formMode === 'signup') {
        await signUp(formData);
        showError('회원가입 성공! 로그인해주세요', 'green');
        setFormMode('login');
      } else if (formMode === 'login') {
        const responseData = await logIn(formData.nickname, formData.password);
        if (responseData.status === 200) {
          const data = responseData.data;
          const accessToken = typeof data === 'string' ? data : data?.accessToken;
          const refreshToken = typeof data === 'string' ? data : data?.refreshToken;

          if (!accessToken || !refreshToken) {
            throw new Error('Authentication token not received');
          }

          try {
            const userResponse = await getUserInfo(accessToken);
            if (userResponse.status === 200 && userResponse.data) {
              login(accessToken, refreshToken, userResponse.data);
            } else {
              login(accessToken, refreshToken);
            }
          } catch (error) {
            console.error('Failed to fetch user info:', error);
            login(accessToken, refreshToken);
          }

          if (fullRedirectUrl) {
            if (fullRedirectUrl.startsWith('/')) {
              navigate(fullRedirectUrl);
            } else {
              window.location.href = fullRedirectUrl;
            }
          } else {
            navigate('/');
          }
        } else {
          showError('로그인 데이터가 올바르지 않습니다');
        }
      } else if (formMode === 'findNickname') {
        await findNickname(formData.email);
        showError('닉네임이 이메일로 전송되었습니다.', 'black');
      } else if (formMode === 'resetPassword') {
        await requestPasswordReset(formData.email);
        showError('비밀번호 재설정 링크가 이메일로 전송되었습니다.', 'black');
      }
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError('알 수 없는 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (formMode) {
      case 'login':
        return (
          <>
            <Input
              type='text'
              placeholder='닉네임'
              value={formData.nickname}
              onChange={e => setFormData({ ...formData, nickname: e.target.value })}
              style={{ borderColor: fieldValidity.nickname ? '#ddd' : 'red' }}
            />
            <ValidationMessage $valid={fieldValidity.nickname}>
              {fieldValidity.nickname ? '' : '닉네임을 입력해주세요'}
            </ValidationMessage>

            <Input
              type='password'
              placeholder='비밀번호'
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              style={{ borderColor: fieldValidity.password ? '#ddd' : 'red' }}
            />
            <ValidationMessage $valid={fieldValidity.password}>
              {formData.password.trim() === ''
                ? '비밀번호를 입력해주세요'
                : fieldValidity.password
                  ? ''
                  : '비밀번호를 입력해주세요'}
            </ValidationMessage>

            <Button type='submit' $disabled={!Object.values(isFormValid).every(Boolean) || loading}>
              {loading ? '처리 중...' : '로그인'}
            </Button>
          </>
        );

      case 'signup':
        return (
          <>
            <Input
              type='email'
              placeholder='이메일'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={{ borderColor: fieldValidity.email ? '#ddd' : 'red' }}
            />
            <ValidationMessage $valid={fieldValidity.email}>
              {formData.email.trim() === ''
                ? '이메일을 입력해주세요'
                : fieldValidity.email
                  ? ''
                  : '유효한 이메일을 입력해주세요'}
            </ValidationMessage>

            <Input
              type='text'
              placeholder='닉네임'
              value={formData.nickname}
              onChange={e => setFormData({ ...formData, nickname: e.target.value })}
              style={{ borderColor: fieldValidity.nickname ? '#ddd' : 'red' }}
            />
            <ValidationMessage $valid={fieldValidity.nickname}>
              {fieldValidity.nickname ? '' : '닉네임을 입력해주세요'}
            </ValidationMessage>

            <Input
              type='password'
              placeholder='비밀번호'
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              style={{ borderColor: fieldValidity.password ? '#ddd' : 'red' }}
            />
            <ValidationMessage $valid={fieldValidity.password}>
              {formData.password.trim() === ''
                ? '비밀번호를 입력해주세요'
                : fieldValidity.password
                  ? ''
                  : '8자리 이상의 비밀번호를 입력해주세요'}
            </ValidationMessage>

            <Input
              type='number'
              placeholder='인증코드'
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              style={{
                borderColor: fieldValidity.code ? '#ddd' : 'red',
              }}
            />
            <ValidationMessage $valid={fieldValidity.code}>
              {fieldValidity.code ? '' : '인증코드를 입력해주세요'}
            </ValidationMessage>
            <Button type='button' onClick={handleSendCode} $disabled={timeLeft > 0 || loading}>
              {timeLeft > 0 ? '인증코드 재전송' : '인증코드 전송'}
            </Button>

            <Button type='submit' $disabled={!Object.values(isFormValid).every(Boolean) || loading}>
              {loading ? '처리 중...' : '회원가입'}
            </Button>
          </>
        );

      case 'findNickname':
        return (
          <>
            <Input
              type='email'
              placeholder='이메일'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={{ borderColor: fieldValidity.email ? '#ddd' : 'red' }}
            />
            <ValidationMessage $valid={fieldValidity.email}>
              {formData.email.trim() === ''
                ? '이메일을 입력해주세요'
                : fieldValidity.email
                  ? ''
                  : '유효한 이메일을 입력해주세요'}
            </ValidationMessage>

            <Button type='submit' $disabled={!fieldValidity.email || loading}>
              {loading ? '처리 중...' : '닉네임 찾기'}
            </Button>
          </>
        );

      case 'resetPassword':
        return (
          <>
            <Input
              type='email'
              placeholder='이메일'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={{ borderColor: fieldValidity.email ? '#ddd' : 'red' }}
            />
            <ValidationMessage $valid={fieldValidity.email}>
              {formData.email.trim() === ''
                ? '이메일을 입력해주세요'
                : fieldValidity.email
                  ? ''
                  : '유효한 이메일을 입력해주세요'}
            </ValidationMessage>

            <Button type='submit' $disabled={!fieldValidity.email || loading}>
              {loading ? '처리 중...' : '비밀번호 찾기'}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const renderFormFooter = () => {
    switch (formMode) {
      case 'login':
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <Button
              type='button'
              onClick={() => setFormMode('signup')}
              $disabled={loading}
              style={{ background: 'none', color: theme.primary }}
            >
              회원가입
            </Button>
            <Button
              type='button'
              onClick={() => setFormMode('findNickname')}
              style={{ background: 'none', color: theme.primary }}
            >
              닉네임 찾기
            </Button>
            <Button
              type='button'
              onClick={() => setFormMode('resetPassword')}
              style={{ background: 'none', color: theme.primary }}
            >
              비밀번호 찾기
            </Button>
          </div>
        );
      case 'signup':
      case 'findNickname':
      case 'resetPassword':
        return (
          <Button
            type='button'
            onClick={() => setFormMode('login')}
            $disabled={loading}
            style={{ background: 'none', color: theme.primary }}
          >
            로그인 화면으로 돌아가기
          </Button>
        );
      default:
        return null;
    }
  };

  const getFormTitle = () => {
    switch (formMode) {
      case 'login':
        return '로그인';
      case 'signup':
        return '회원가입';
      case 'findNickname':
        return '닉네임 찾기';
      case 'resetPassword':
        return '비밀번호 찾기';
      default:
        return '';
    }
  };

  return (
    <>
      <Helmet>
        <title>{getFormTitle()}</title>
      </Helmet>
      <PageContainer>
        <ContentWrapper>
          <h2 style={{ textAlign: 'left' }}>{getFormTitle()}</h2>
          <Form onSubmit={handleSubmit}>{renderForm()}</Form>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>{renderFormFooter()}</div>
        </ContentWrapper>
      </PageContainer>
      {showErrorModal && (
        <ErrorModal>
          <p style={{ color: errorColor }}>{error}</p>
          <Button onClick={() => setShowErrorModal(false)} style={{ marginTop: '1rem' }}>
            확인
          </Button>
        </ErrorModal>
      )}
    </>
  );
};
