import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../../../features/auth";
import Cookies from "js-cookie";

export const NewOAuthAppPage = () => {
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceDomain: "",
    scope: "email,nickname",
    allowedUserType: "all",
    redirectUris: [""],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!user && !token) {
      navigate("/login?redirect=/oauth/new");
      return;
    }
  }, [navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRedirectUriChange = (index: number, value: string) => {
    const updatedUris = [...formData.redirectUris];
    updatedUris[index] = value;
    setFormData((prev) => ({ ...prev, redirectUris: updatedUris }));
  };

  const addRedirectUri = () => {
    setFormData((prev) => ({
      ...prev,
      redirectUris: [...prev.redirectUris, ""],
    }));
  };

  const removeRedirectUri = (index: number) => {
    if (formData.redirectUris.length <= 1) return;
    
    const updatedUris = formData.redirectUris.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, redirectUris: updatedUris }));
  };

  const handleScopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    let updatedScopes = formData.scope.split(",").filter(Boolean);
    
    if (checked) {
      if (!updatedScopes.includes(value)) {
        updatedScopes.push(value);
      }
    } else {
      updatedScopes = updatedScopes.filter(scope => scope !== value);
    }
    
    setFormData(prev => ({
      ...prev,
      scope: updatedScopes.join(","),
    }));
  };

  const validateForm = () => {
    if (!formData.serviceName.trim()) {
      setError("서비스 이름을 입력해주세요.");
      return false;
    }
    
    if (!formData.serviceDomain.trim()) {
      setError("서비스 도메인을 입력해주세요.");
      return false;
    }
    
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(formData.serviceDomain)) {
      setError("유효한 도메인 형식이 아닙니다 (예: example.com).");
      return false;
    }
    
    if (formData.redirectUris.some(uri => !uri.trim())) {
      setError("모든 리다이렉션 URL을 입력해주세요.");
      return false;
    }

    const urlRegex = /^https?:\/\/.+/;
    if (formData.redirectUris.some(uri => !urlRegex.test(uri))) {
      setError("모든 리다이렉션 URL은 http:// 또는 https://로 시작해야 합니다.");
      return false;
    }
    
    if (!formData.scope) {
      setError("최소 하나의 권한 범위를 선택해주세요.");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          body: JSON.stringify(formData),
        }
      );
      
      const data = await response.json();

      console.log("Response data:", data);
      
      if (data.status === 201) {
        navigate("/oauth/manage");
      } else {
        setError(data.message || "애플리케이션 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("Error creating OAuth app:", err);
      setError("애플리케이션 등록 중 오류가 발생했습니다.");
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
            <Label htmlFor="serviceName">서비스 이름</Label>
            <Input
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="사용자에게 표시될 애플리케이션 이름"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="serviceDomain">서비스 도메인</Label>
            <Input
              id="serviceDomain"
              name="serviceDomain"
              value={formData.serviceDomain}
              onChange={handleChange}
              placeholder="example.com"
              required
            />
            <HelperText>로고를 자동으로 가져오기 위해 사용됩니다.</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>권한 범위 (스코프)</Label>
            <CheckboxContainer>
              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox 
                    type="checkbox" 
                    name="scope" 
                    value="email" 
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
                    type="checkbox" 
                    name="scope" 
                    value="nickname" 
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
                    type="checkbox" 
                    name="scope" 
                    value="role" 
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
                    type="checkbox" 
                    name="scope" 
                    value="major" 
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
                    type="checkbox" 
                    name="scope" 
                    value="admission" 
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
                    type="checkbox" 
                    name="scope" 
                    value="generation" 
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
                    type="checkbox" 
                    name="scope" 
                    value="isGraduated" 
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
            <Label htmlFor="allowedUserType">허용 사용자 유형</Label>
            <Select
              id="allowedUserType"
              name="allowedUserType"
              value={formData.allowedUserType}
              onChange={handleChange}
            >
              <option value="all">모든 사용자</option>
              <option value="student">학생만</option>
              <option value="teacher">교사만</option>
            </Select>
            <HelperText>이 애플리케이션에 로그인할 수 있는 사용자 유형</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>리다이렉션 URL</Label>
            <RedirectContainer>
              {formData.redirectUris.map((uri, index) => (
                <RedirectInputGroup key={index}>
                  <RedirectInput
                    value={uri}
                    onChange={(e) => handleRedirectUriChange(index, e.target.value)}
                    placeholder="https://example.com/oauth/callback"
                    required
                  />
                  <RemoveButton
                    type="button"
                    onClick={() => removeRedirectUri(index)}
                    disabled={formData.redirectUris.length <= 1}
                  >
                    삭제
                  </RemoveButton>
                </RedirectInputGroup>
              ))}
              <AddButton type="button" onClick={addRedirectUri}>
                + 리다이렉션 URL 추가
              </AddButton>
            </RedirectContainer>
            <HelperText>
              사용자 인증 후 리디렉션될 URL을 입력하세요. 
              반드시 https:// 또는 http://localhost로 시작해야 합니다.
            </HelperText>
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate("/oauth/manage")}>
              취소
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? "처리 중..." : "앱 등록하기"}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const FormContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  padding: 30px;
`;

const FormHeader = styled.div`
  margin-bottom: 30px;
  
  h1 {
    margin: 0 0 10px;
    font-size: 24px;
  }
  
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.secondaryText};
    font-size: 16px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 5px;
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 5px;
  font-size: 15px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 15px top 50%;
  background-size: 12px auto;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const CheckboxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
`;

const CheckboxGroup = styled.div``;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const HelpText = styled.div`
  margin-top: 4px;
  margin-left: 28px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const HelperText = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const RedirectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RedirectInputGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const RedirectInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  padding: 0 15px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 5px;
  background: white;
  color: ${({ theme }) => theme.colors.error};
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
  padding: 8px 15px;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 5px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 25px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
`;