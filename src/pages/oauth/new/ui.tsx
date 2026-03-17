import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { z } from 'zod';

import { createOAuthApp } from '@/features/oauth';
import { RequiredMark } from '@/shared/ui/RequiredMark';

export const NewOAuthAppPage = () => {
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

  const [formData, setFormData] = useState({
    serviceName: '',
    serviceDomain: '',
    scope: 'email,nickname',
    allowedUserType: 'all',
    redirectUris: [''],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    const parsed = oauthFormSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.');
      return;
    }

    setLoading(true);

    try {
      const data = await createOAuthApp(parsed.data);

      if (data.status === 201) {
        navigate('/oauth/manage');
      } else {
        setError(data.message || '애플리케이션 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error creating OAuth app:', err);
      setError('애플리케이션 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormContainer>
        <FormHeader>
          <h1>새 OAuth 앱 등록</h1>
          <p>미림마이스터고 OAuth 서비스를 사용하여 학교 구성원들에게 서비스를 제공하세요.</p>
        </FormHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
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
            <SubmitButton type='submit' disabled={loading}>
              {loading ? '처리 중...' : '앱 등록하기'}
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

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
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

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.errorLight};
  border: 1px solid ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};
  padding: 11px 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 0.83rem;
`;
