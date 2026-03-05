import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import {
  logIn,
  sendVerificationCode,
  signUp,
  getUserInfo,
  requestPasswordReset,
  findNickname,
} from '@/features/auth/api/index';
import { storePasswordCredential } from '@/features/auth/store-password-credential';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  gap: 1rem;
  display: flex;
  flex-direction: column;
`;

const FormTitle = styled.h2`
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 1.5rem;
  border-radius: 12px;
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

const Input = styled.input<{ $invalid?: boolean }>`
  padding: 0.8rem;
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.error : theme.colors.border)};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  font-size: 1rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
  }
`;

const Button = styled.button<{ $disabled?: boolean }>`
  padding: 0.8rem;
  background-color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.disabled : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;
`;

const ValidationMessage = styled.small<{ $valid: boolean }>`
  color: ${({ theme, $valid }) => ($valid ? theme.colors.primary : theme.colors.error)};
  margin-top: -0.5rem;
  text-align: left;
`;

const TextButton = styled(Button)`
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  padding: 0.3rem 0.2rem;
  border-radius: 0;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  gap: 0.5rem;
`;

const FormFooter = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.p<{ $tone: 'error' | 'success' }>`
  color: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.error : theme.colors.success)};
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
  const [errorTone, setErrorTone] = useState<'error' | 'success'>('error');
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

  const showError = (message: string, tone: 'error' | 'success' = 'error') => {
    setError(message);
    setShowErrorModal(true);
    setErrorTone(tone);
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
        showError('회원가입 성공! 로그인해주세요', 'success');
        setFormMode('login');
      } else if (formMode === 'login') {
        const responseData = await logIn(formData.nickname, formData.password);
        if (responseData.status === 200) {
          await storePasswordCredential(formData.nickname, formData.password);
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
        showError('닉네임이 이메일로 전송되었습니다.', 'success');
      } else if (formMode === 'resetPassword') {
        await requestPasswordReset(formData.email);
        showError('비밀번호 재설정 링크가 이메일로 전송되었습니다.', 'success');
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
              name='username'
              autoComplete='username'
              autoCapitalize='none'
              autoCorrect='off'
              placeholder='닉네임'
              value={formData.nickname}
              onChange={e => setFormData({ ...formData, nickname: e.target.value })}
              $invalid={!fieldValidity.nickname}
            />
            <ValidationMessage $valid={fieldValidity.nickname}>
              {fieldValidity.nickname ? '' : '닉네임을 입력해주세요'}
            </ValidationMessage>

            <Input
              type='password'
              name='password'
              autoComplete='current-password'
              placeholder='비밀번호'
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              $invalid={!fieldValidity.password}
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
              name='email'
              autoComplete='email'
              placeholder='이메일'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              $invalid={!fieldValidity.email}
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
              name='username'
              autoComplete='username'
              autoCapitalize='none'
              autoCorrect='off'
              placeholder='닉네임'
              value={formData.nickname}
              onChange={e => setFormData({ ...formData, nickname: e.target.value })}
              $invalid={!fieldValidity.nickname}
            />
            <ValidationMessage $valid={fieldValidity.nickname}>
              {fieldValidity.nickname ? '' : '닉네임을 입력해주세요'}
            </ValidationMessage>

            <Input
              type='password'
              name='new-password'
              autoComplete='new-password'
              placeholder='비밀번호'
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              $invalid={!fieldValidity.password}
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
              name='verification-code'
              autoComplete='one-time-code'
              placeholder='인증코드'
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              $invalid={!fieldValidity.code}
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
              name='email'
              autoComplete='email'
              placeholder='이메일'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              $invalid={!fieldValidity.email}
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
              name='email'
              autoComplete='email'
              placeholder='이메일'
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              $invalid={!fieldValidity.email}
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
          <FooterRow>
            <TextButton type='button' onClick={() => setFormMode('signup')} $disabled={loading}>
              회원가입
            </TextButton>
            <TextButton type='button' onClick={() => setFormMode('findNickname')}>
              닉네임 찾기
            </TextButton>
            <TextButton type='button' onClick={() => setFormMode('resetPassword')}>
              비밀번호 찾기
            </TextButton>
          </FooterRow>
        );
      case 'signup':
      case 'findNickname':
      case 'resetPassword':
        return (
          <TextButton type='button' onClick={() => setFormMode('login')} $disabled={loading}>
            로그인 화면으로 돌아가기
          </TextButton>
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
          <FormTitle>{getFormTitle()}</FormTitle>
          <Form onSubmit={handleSubmit} autoComplete='on'>
            {renderForm()}
          </Form>
          <FormFooter>{renderFormFooter()}</FormFooter>
        </ContentWrapper>
      </PageContainer>
      {showErrorModal && (
        <ErrorModal>
          <ErrorMessage $tone={errorTone}>{error}</ErrorMessage>
          <Button onClick={() => setShowErrorModal(false)}>확인</Button>
        </ErrorModal>
      )}
    </>
  );
};
