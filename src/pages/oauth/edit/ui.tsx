import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { z } from 'zod';

import { useAuthStore } from '@/features/auth';
import { getOAuthApp, updateOAuthApp, refreshToken, OAuthApp } from '@/features/oauth';
import { RequiredMark } from '@/shared/ui/RequiredMark';

export const EditOAuthAppPage = () => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  const urlRegex = /^https?:\/\/.+/;
  const customUrlRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[a-zA-Z0-9].*$/;
  const oauthFormSchema = z.object({
    serviceName: z.string().trim().min(1, '서비스 이름을 입력해주세요.'),
    serviceDomain: z
      .string()
      .trim()
      .min(1, '서비스 도메인을 입력해주세요.')
      .refine(value => domainRegex.test(value), '유효한 도메인 형식이 아닙니다 (예: example.com).'),
    scope: z.string().trim().min(1, '최소 하나의 권한 범위를 선택해주세요.'),
    allowedUserType: z.enum(['all', 'student', 'teacher']),
    redirectUris: z
      .array(
        z
          .string()
          .trim()
          .min(1, '모든 리다이렉션 URL을 입력해주세요.')
          .refine(
            value => urlRegex.test(value) || customUrlRegex.test(value),
            '모든 리다이렉션 URL은 http:// 또는 https://로 시작하거나 test://callback 형식이어야 합니다.',
          ),
      )
      .min(1, '리다이렉션 URL을 최소 1개 이상 입력해주세요.'),
  });

  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<Omit<OAuthApp, 'id' | 'clientId' | 'clientSecret'>>({
    serviceName: '',
    serviceDomain: '',
    scope: '',
    redirectUris: [''],
    allowedUserType: 'all',
  });

  const [appData, setAppData] = useState<OAuthApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, logout, setIsAuthModalOpen } = useAuthStore();

  const handleAuthRequired = useCallback(() => {
    logout();
    setIsAuthModalOpen(true);
    setError('로그인이 필요합니다.');
  }, [logout, setIsAuthModalOpen]);

  const isTokenExpired = (status?: number, message?: string) =>
    status === 401 || message === 'TOKEN_EXPIRED' || message === 'Token expired';

  const fetchAppData = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getOAuthApp(id);

      if (data.status === 200) {
        setAppData(data.data);
        setFormData({
          serviceName: data.data.serviceName,
          serviceDomain: data.data.serviceDomain,
          scope: data.data.scope,
          redirectUris: data.data.redirectUris,
          allowedUserType: data.data.allowedUserType,
        });
      } else if (isTokenExpired(data.status, data.message)) {
        try {
          const refreshData = await refreshToken();
          login(refreshData.accessToken, refreshData.refreshToken);
          return fetchAppData();
        } catch {
          handleAuthRequired();
          return;
        }
      } else {
        setError(data.message || '애플리케이션 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('애플리케이션 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleAuthRequired, id, login]);

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRedirectUriChange = (index: number, value: string) => {
    const updatedUris = [...formData.redirectUris];
    updatedUris[index] = value;
    setFormData(prev => ({ ...prev, redirectUris: updatedUris }));
  };

  const addRedirectUri = () => {
    setFormData(prev => ({
      ...prev,
      redirectUris: [...prev.redirectUris, ''],
    }));
  };

  const removeRedirectUri = (index: number) => {
    if (formData.redirectUris.length <= 1) return;

    const updatedUris = formData.redirectUris.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, redirectUris: updatedUris }));
  };

  const handleScopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    let updatedScopes = formData.scope.split(',').filter(Boolean);

    if (checked) {
      if (!updatedScopes.includes(value)) {
        updatedScopes.push(value);
      }
    } else {
      updatedScopes = updatedScopes.filter(scope => scope !== value);
    }

    setFormData(prev => ({
      ...prev,
      scope: updatedScopes.join(','),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!id) return;
    const parsed = oauthFormSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const data = await updateOAuthApp(id, parsed.data);

      if (data.status === 200) {
        navigate('/oauth/manage');
      } else if (isTokenExpired(data.status, data.message)) {
        try {
          const refreshData = await refreshToken();
          login(refreshData.accessToken, refreshData.refreshToken);
          const retriedData = await updateOAuthApp(id, parsed.data);
          if (retriedData.status === 200) {
            navigate('/oauth/manage');
            return;
          }
          if (isTokenExpired(retriedData.status, retriedData.message)) {
            handleAuthRequired();
            return;
          }
          setError(retriedData.message || '애플리케이션 수정에 실패했습니다.');
        } catch {
          handleAuthRequired();
        }
      } else {
        setError(data.message || '애플리케이션 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error updating OAuth app:', err);
      setError('애플리케이션 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    );
  }

  if (error && !formData.serviceName) {
    return (
      <Container>
        <ErrorContainer>
          <h2>오류 발생</h2>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={() => navigate('/oauth/manage')}>돌아가기</Button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <FormContainer>
        <FormHeader>
          <h1>OAuth 앱 수정</h1>
          <p>애플리케이션 세부 정보를 변경합니다.</p>
        </FormHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor='clientId'>클라이언트 ID</Label>
            <Input id='clientId' value={appData?.clientId || ''} disabled />
          </FormGroup>

          <FormGroup>
            <Label htmlFor='clientSecret'>클라이언트 시크릿</Label>
            <SecretGroup>
              <SecretInput
                id='clientSecret'
                value={appData?.clientSecret.substring(0, 8) + '...' || ''}
                disabled
              />
              <CopyButton
                type='button'
                onClick={() => {
                  if (appData?.clientSecret) {
                    navigator.clipboard.writeText(appData.clientSecret);
                    alert('클라이언트 시크릿이 클립보드에 복사되었습니다.');
                  }
                }}
              >
                복사
              </CopyButton>
            </SecretGroup>
          </FormGroup>

          <FormGroup>
            <Label htmlFor='serviceName'>
              서비스 이름
              <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id='serviceName'
              name='serviceName'
              value={formData.serviceName}
              onChange={handleChange}
              placeholder='사용자에게 표시될 애플리케이션 이름'
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor='serviceDomain'>
              서비스 도메인
              <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id='serviceDomain'
              name='serviceDomain'
              value={formData.serviceDomain}
              onChange={handleChange}
              placeholder='example.com'
              required
            />
            <HelperText>로고를 자동으로 가져오기 위해 사용됩니다.</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>
              권한 범위 (스코프)
              <RequiredMark>*</RequiredMark>
            </Label>
            <CheckboxContainer>
              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    name='scope'
                    value='email'
                    checked={formData.scope.includes('email')}
                    onChange={handleScopeChange}
                  />
                  <span>이메일</span>
                </CheckboxLabel>
                <HelpText>사용자의 학교 이메일 주소에 접근</HelpText>
              </CheckboxGroup>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    name='scope'
                    value='nickname'
                    checked={formData.scope.includes('nickname')}
                    onChange={handleScopeChange}
                  />
                  <span>닉네임</span>
                </CheckboxLabel>
                <HelpText>사용자의 닉네임에 접근</HelpText>
              </CheckboxGroup>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    name='scope'
                    value='role'
                    checked={formData.scope.includes('role')}
                    onChange={handleScopeChange}
                  />
                  <span>역할</span>
                </CheckboxLabel>
                <HelpText>사용자의 역할(학생/교사)에 접근</HelpText>
              </CheckboxGroup>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    name='scope'
                    value='major'
                    checked={formData.scope.includes('major')}
                    onChange={handleScopeChange}
                  />
                  <span>전공</span>
                </CheckboxLabel>
                <HelpText>사용자의 전공(소프트웨어/디자인/웹) 정보에 접근</HelpText>
              </CheckboxGroup>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    name='scope'
                    value='admission'
                    checked={formData.scope.includes('admission')}
                    onChange={handleScopeChange}
                  />
                  <span>입학년도</span>
                </CheckboxLabel>
                <HelpText>사용자의 입학년도 정보에 접근</HelpText>
              </CheckboxGroup>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    name='scope'
                    value='generation'
                    checked={formData.scope.includes('generation')}
                    onChange={handleScopeChange}
                  />
                  <span>기수</span>
                </CheckboxLabel>
                <HelpText>사용자의 기수 정보에 접근</HelpText>
              </CheckboxGroup>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    name='scope'
                    value='isGraduated'
                    checked={formData.scope.includes('isGraduated')}
                    onChange={handleScopeChange}
                  />
                  <span>졸업 여부</span>
                </CheckboxLabel>
                <HelpText>사용자의 졸업 여부에 접근</HelpText>
              </CheckboxGroup>
            </CheckboxContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor='allowedUserType'>
              허용 사용자 유형
              <RequiredMark>*</RequiredMark>
            </Label>
            <Select
              id='allowedUserType'
              name='allowedUserType'
              value={formData.allowedUserType}
              onChange={handleChange}
            >
              <option value='all'>모든 사용자</option>
              <option value='student'>학생만</option>
              <option value='teacher'>교사만</option>
            </Select>
            <HelperText>이 애플리케이션에 로그인할 수 있는 사용자 유형</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>
              리다이렉션 URL
              <RequiredMark>*</RequiredMark>
            </Label>
            <RedirectContainer>
              {formData.redirectUris.map((uri, index) => (
                <RedirectInputGroup key={index}>
                  <RedirectInput
                    value={uri}
                    onChange={e => handleRedirectUriChange(index, e.target.value)}
                    placeholder='https://example.com/oauth/callback'
                    required
                  />
                  <RemoveButton
                    type='button'
                    onClick={() => removeRedirectUri(index)}
                    disabled={formData.redirectUris.length <= 1}
                  >
                    삭제
                  </RemoveButton>
                </RedirectInputGroup>
              ))}
              <AddButton type='button' onClick={addRedirectUri}>
                + 리다이렉션 URL 추가
              </AddButton>
            </RedirectContainer>
            <HelperText>
              사용자 인증 후 리디렉션될 URL을 입력하세요. 반드시 https:// 또는 http://localhost로
              시작해야 합니다.
            </HelperText>
          </FormGroup>

          <ButtonGroup>
            <CancelButton type='button' onClick={() => navigate('/oauth/manage')}>
              취소
            </CancelButton>
            <SubmitButton type='submit' disabled={submitting}>
              {submitting ? '처리 중...' : '저장하기'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 20px;
`;

const FormHeader = styled.div`
  margin-bottom: 18px;

  h1 {
    margin: 0 0 8px;
    font-size: 1.26rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.secondaryText};
    font-size: 0.86rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  font-size: 0.92rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.mutedText};
    cursor: not-allowed;
  }

  &:focus:not(:disabled) {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const SecretGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const SecretInput = styled(Input)`
  flex: 1;
`;

const CopyButton = styled.button`
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  font-size: 0.92rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const CheckboxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

const CheckboxGroup = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  padding: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Checkbox = styled.input`
  margin-right: 10px;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const HelpText = styled.div`
  margin-top: 5px;
  margin-left: 26px;
  font-size: 0.76rem;
  color: ${({ theme }) => theme.colors.secondaryText};
  line-height: 1.4;
`;

const HelperText = styled.div`
  margin-top: 8px;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.secondaryText};
  line-height: 1.4;
`;

const RedirectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RedirectInputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const RedirectInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.errorLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  align-self: flex-start;
  min-height: 34px;
  padding: 0 12px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 9px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 2px;
`;

const Button = styled.button`
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 30px 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.errorLight};
  border: 1px solid ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};
  padding: 11px 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 0.83rem;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 28px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.secondaryText};
`;
