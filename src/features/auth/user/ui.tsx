import { useState, useEffect, useMemo } from 'react';
import { styled } from 'styled-components';

import {
  logIn,
  sendVerificationCode,
  signUp,
  getUserInfo,
  requestPasswordReset,
  findNickname,
} from '../api';

import { theme } from '@/app/styles';
import { useAuthStore } from '@/features/auth/hooks';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  position: relative;
  gap: 1rem;
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: 2px solid ${theme.colors.primary};
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

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
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

const ValidationMessage = styled.small<{ $valid: boolean }>`
  color: ${props => (props.$valid ? theme.primary : 'red')};
  margin-top: -0.5rem;
  text-align: left;
`;

const Timer = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.primary};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.primary};
  text-decoration: underline;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const modes = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FIND_NICKNAME: 'find-nickname',
  REQUEST_PASSWORD_RESET: 'request-password-reset',
  RESET_PASSWORD: 'reset-password',
};

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    code: '',
    newPassword: '',
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorColor, setErrorColor] = useState('red');
  const [mode, setMode] = useState(modes.LOGIN);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fieldValidity, setFieldValidity] = useState({
    email: false,
    nickname: false,
    password: false,
    code: false,
    newPassword: false,
  });

  const { login, setUser } = useAuthStore();

  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', nickname: '', password: '', code: '', newPassword: '' });
      setTimeLeft(0);
      setMode(modes.LOGIN);
      setError('');
      setFieldValidity({
        email: false,
        nickname: false,
        password: false,
        code: false,
        newPassword: false,
      });
    }
  }, [isOpen]);

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
    switch (mode) {
      case modes.LOGIN:
        return {
          email: true,
          nickname: !!formData.nickname.trim(),
          password: !!formData.password.trim(),
          code: true,
          newPassword: true,
        };
      case modes.SIGNUP:
        return {
          email: formData.email.trim() !== '' && isValidEmail(formData.email),
          nickname: !!formData.nickname.trim(),
          password: formData.password.trim().length >= 8,
          code: !!formData.code.trim(),
          newPassword: true,
        };
      case modes.FIND_NICKNAME:
        return {
          email: formData.email.trim() !== '' && isValidEmail(formData.email),
          nickname: true,
          password: true,
          code: true,
          newPassword: true,
        };
      case modes.REQUEST_PASSWORD_RESET:
        return {
          email: formData.email.trim() !== '' && isValidEmail(formData.email),
          nickname: true,
          password: true,
          code: true,
          newPassword: formData.newPassword.trim().length >= 8,
        };
      default:
        return {
          email: false,
          nickname: false,
          password: false,
          code: false,
          newPassword: false,
        };
    }
  }, [formData, mode]);

  useEffect(() => {
    setFieldValidity(isFormValid);
  }, [isFormValid]);

  const showError = (message: string, color = 'red') => {
    setError(message);
    setErrorColor(color);
    setShowErrorModal(true);
    setTimeout(() => setShowErrorModal(false), 2000);
  };

  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      showError('이메일을 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      if (mode === modes.SIGNUP) {
        await sendVerificationCode(formData.email);
      } else if (mode === modes.REQUEST_PASSWORD_RESET) {
        await requestPasswordReset(formData.email);
      }
      setTimeLeft(300);
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
      switch (mode) {
        case modes.SIGNUP:
          await signUp({
            email: formData.email,
            nickname: formData.nickname,
            password: formData.password,
            code: formData.code,
          });
          showError('회원가입 성공! 로그인해주세요', 'black');
          setMode(modes.LOGIN);
          break;

        case modes.LOGIN: {
          const responseData = await logIn(formData.nickname, formData.password);
          if (responseData.status === 200) {
            if (typeof responseData.data === 'object') {
              login(responseData.data.accessToken, responseData.data.refreshToken);

              try {
                const userInfoResponse = await getUserInfo(responseData.data.accessToken);
                if (userInfoResponse.status === 200 && userInfoResponse.data) {
                  setUser(userInfoResponse.data);
                }
              } catch (userInfoError) {
                console.error('Failed to fetch user info:', userInfoError);
              }
            } else {
              showError('로그인 데이터가 올바르지 않습니다');
            }
          } else {
            showError('로그인 실패');
          }
          onClose();
          break;
        }

        case modes.FIND_NICKNAME:
          await findNickname(formData.email);
          showError('닉네임이 이메일로 전송되었습니다.', 'black');
          setMode(modes.LOGIN);
          break;

        case modes.REQUEST_PASSWORD_RESET:
          await requestPasswordReset(formData.email);
          showError('비밀번호 재설정 링크가 이메일로 전송되었습니다.', 'black');
          setMode(modes.RESET_PASSWORD);
          break;
      }
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case modes.LOGIN:
        return '로그인';
      case modes.SIGNUP:
        return '회원가입';
      case modes.FIND_NICKNAME:
        return '닉네임 찾기';
      case modes.REQUEST_PASSWORD_RESET:
        return '비밀번호 찾기';
      default:
        return '';
    }
  };

  const renderForm = () => {
    switch (mode) {
      case modes.LOGIN:
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
              {fieldValidity.password ? '' : '비밀번호를 입력해주세요'}
            </ValidationMessage>
          </>
        );

      case modes.SIGNUP:
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

            <div style={{ position: 'relative' }}>
              <Input
                type='number'
                placeholder='인증코드'
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                style={{ borderColor: fieldValidity.code ? '#ddd' : 'red', paddingRight: '70px' }}
              />
              {timeLeft > 0 && (
                <Timer>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </Timer>
              )}
            </div>
            <ValidationMessage $valid={fieldValidity.code}>
              {fieldValidity.code ? '' : '인증코드를 입력해주세요'}
            </ValidationMessage>

            <Button type='button' onClick={handleSendCode} $disabled={timeLeft > 0 || loading}>
              {timeLeft > 0 ? '인증코드 재전송' : '인증코드 전송'}
            </Button>
          </>
        );

      case modes.FIND_NICKNAME:
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

            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              가입 시 사용한 이메일 주소를 입력하시면, 해당 이메일로 닉네임을 보내드립니다.
            </p>
          </>
        );

      case modes.REQUEST_PASSWORD_RESET:
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

            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              가입 시 사용한 이메일 주소를 입력하시면, 비밀번호 재설정 코드를 보내드립니다.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  const renderFooter = () => {
    if (mode === modes.LOGIN) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Button
            type='button'
            onClick={() => setMode(modes.SIGNUP)}
            $disabled={loading}
            style={{ background: 'none', color: theme.primary }}
          >
            회원가입
          </Button>
          <Button
            type='button'
            onClick={() => setMode(modes.FIND_NICKNAME)}
            style={{ background: 'none', color: theme.primary }}
          >
            닉네임 찾기
          </Button>
          <Button
            type='button'
            onClick={() => setMode(modes.REQUEST_PASSWORD_RESET)}
            style={{ background: 'none', color: theme.primary }}
          >
            비밀번호 찾기
          </Button>
        </div>
      );
    } else {
      return <BackButton onClick={() => setMode(modes.LOGIN)}>로그인 화면으로 돌아가기</BackButton>;
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <h2>{getModalTitle()}</h2>

        <Form onSubmit={handleSubmit}>
          {renderForm()}

          <Button type='submit' $disabled={!Object.values(isFormValid).every(Boolean) || loading}>
            {loading ? '처리 중...' : getModalTitle()}
          </Button>
        </Form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>{renderFooter()}</div>

        {showErrorModal && (
          <ErrorModal>
            <p style={{ color: errorColor }}>{error}</p>
            <Button onClick={() => setShowErrorModal(false)} style={{ marginTop: '1rem' }}>
              확인
            </Button>
          </ErrorModal>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};
