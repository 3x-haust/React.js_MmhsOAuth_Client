import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import type { User } from '@/features/auth';
import { requestPersonalEmailCode, verifyPersonalEmail } from '@/features/profile';

interface PersonalEmailPanelProps {
  user: User;
  onRegistered: () => Promise<void>;
}

type MessageTone = 'success' | 'error';

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isSchoolEmail = (email: string): boolean => email.toLowerCase().endsWith('@e-mirim.hs.kr');

export function PersonalEmailPanel({ user, onRegistered }: PersonalEmailPanelProps) {
  const [personalEmail, setPersonalEmail] = useState(user.personalEmail ?? '');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>(null);

  useEffect(() => {
    setPersonalEmail(user.personalEmail ?? '');
    setCode('');
    setIsCodeSent(false);
  }, [user.personalEmail]);

  const normalizedPersonalEmail = personalEmail.trim().toLowerCase();
  const schoolEmail = user.schoolEmail || user.email;
  const primaryEmail = user.primaryEmail || user.personalEmail || user.email;
  const canSendCode =
    isValidEmail(normalizedPersonalEmail) &&
    !isSchoolEmail(normalizedPersonalEmail) &&
    !isSending &&
    !isSaving;
  const canVerify = canSendCode && code.trim().length > 0 && isCodeSent && !isSaving;
  const inputError = useMemo(() => {
    if (!personalEmail.trim()) return null;
    if (!isValidEmail(normalizedPersonalEmail)) return '유효한 이메일 주소를 입력해주세요.';
    if (isSchoolEmail(normalizedPersonalEmail)) {
      return '학교 이메일이 아닌 개인 이메일을 입력해주세요.';
    }
    return null;
  }, [normalizedPersonalEmail, personalEmail]);

  const handleSendCode = async () => {
    if (!canSendCode) {
      setMessage({
        tone: 'error',
        text: inputError || '개인 이메일 주소를 확인해주세요.',
      });
      return;
    }

    try {
      setIsSending(true);
      setMessage(null);
      const response = await requestPersonalEmailCode(normalizedPersonalEmail);

      if (response.status === 200 || response.status === 201) {
        setIsCodeSent(true);
        setMessage({ tone: 'success', text: '인증코드를 전송했습니다.' });
        return;
      }

      setMessage({ tone: 'error', text: response.message });
    } catch {
      setMessage({ tone: 'error', text: '인증코드 전송에 실패했습니다.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canVerify) {
      setMessage({ tone: 'error', text: '인증코드를 입력해주세요.' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      const response = await verifyPersonalEmail(normalizedPersonalEmail, code.trim());

      if (response.status === 200) {
        setCode('');
        setIsCodeSent(false);
        setMessage({ tone: 'success', text: '개인 이메일이 기본 이메일로 등록되었습니다.' });
        await onRegistered();
        return;
      }

      setMessage({ tone: 'error', text: response.message });
    } catch {
      setMessage({ tone: 'error', text: '개인 이메일 등록에 실패했습니다.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section aria-labelledby='personal-email-title'>
      <Header>
        <div>
          <Title id='personal-email-title'>기본 이메일</Title>
          <Description>계정 안내와 복구 메일을 받을 주소입니다.</Description>
        </div>
        <StatusBadge $complete={!user.requiresPersonalEmail}>
          {user.requiresPersonalEmail ? '등록 필요' : '등록 완료'}
        </StatusBadge>
      </Header>

      <SummaryGrid>
        <SummaryItem>
          <SummaryLabel>기본 이메일</SummaryLabel>
          <SummaryValue>{primaryEmail}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>학교 이메일</SummaryLabel>
          <SummaryValue>{schoolEmail}</SummaryValue>
        </SummaryItem>
        {user.personalEmail && (
          <SummaryItem>
            <SummaryLabel>개인 이메일</SummaryLabel>
            <SummaryValue>{user.personalEmail}</SummaryValue>
          </SummaryItem>
        )}
      </SummaryGrid>

      {user.requiresPersonalEmail && (
        <Notice>졸업 뒤에도 계정을 복구할 수 있도록 개인 이메일 인증을 완료해주세요.</Notice>
      )}

      <Form onSubmit={handleVerify}>
        <InputRow>
          <Field>
            <Label htmlFor='personalEmail'>개인 이메일</Label>
            <Input
              id='personalEmail'
              type='email'
              autoComplete='email'
              value={personalEmail}
              onChange={event => {
                setPersonalEmail(event.target.value);
                setIsCodeSent(false);
              }}
              placeholder='name@example.com'
              aria-invalid={Boolean(inputError)}
            />
            {inputError && <FieldError>{inputError}</FieldError>}
          </Field>
          <SecondaryButton type='button' onClick={handleSendCode} disabled={!canSendCode}>
            {isSending ? '전송 중...' : '인증코드 전송'}
          </SecondaryButton>
        </InputRow>

        <InputRow>
          <Field>
            <Label htmlFor='personalEmailCode'>인증코드</Label>
            <Input
              id='personalEmailCode'
              type='text'
              inputMode='numeric'
              autoComplete='one-time-code'
              value={code}
              onChange={event => setCode(event.target.value)}
              placeholder='메일로 받은 코드'
            />
          </Field>
          <PrimaryButton type='submit' disabled={!canVerify}>
            {isSaving ? '등록 중...' : '기본 이메일 등록'}
          </PrimaryButton>
        </InputRow>
      </Form>

      {message && <InlineMessage $tone={message.tone}>{message.text}</InlineMessage>}
    </Section>
  );
}

const Section = styled.section`
  display: grid;
  gap: 0.9rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Title = styled.h2`
  margin: 0 0 0.25rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.86rem;
`;

const StatusBadge = styled.span<{ $complete: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 0.65rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
  background: ${({ theme, $complete }) =>
    $complete ? theme.colors.successLight : theme.colors.warningLight};
  color: ${({ theme, $complete }) => ($complete ? theme.colors.success : theme.colors.warning)};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  min-width: 0;
`;

const SummaryLabel = styled.div`
  margin-bottom: 0.2rem;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.78rem;
`;

const SummaryValue = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.92rem;
  overflow-wrap: anywhere;
`;

const Notice = styled.p`
  margin: 0;
  padding: 0.7rem 0.75rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.warningLight};
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.86rem;
  line-height: 1.55;
  word-break: keep-all;
`;

const Form = styled.form`
  display: grid;
  gap: 0.75rem;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.65rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  min-width: 0;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.86rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  min-height: 42px;
  padding: 0.65rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.92rem;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FieldError = styled.div`
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.78rem;
`;

const BaseButton = styled.button`
  min-height: 42px;
  padding: 0 0.95rem;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PrimaryButton = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const SecondaryButton = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
`;

const InlineMessage = styled.div<{ $tone: MessageTone }>`
  color: ${({ theme, $tone }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  font-size: 0.84rem;
`;
