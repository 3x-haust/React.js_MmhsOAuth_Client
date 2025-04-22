import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../../../features/auth";
import Cookies from "js-cookie";

interface ClientInfo {
  id: number;
  clientId: string;
  serviceName: string;
  serviceDomain: string;
  scope: string;
  allowedUserType: string;
}

export const ConsentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope");
  const responseType = searchParams.get("response_type");

  useEffect(() => {
    const token = Cookies.get("accessToken")
    if (!user && !token) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!clientId || !redirectUri || !state || !responseType) {
      setError("필수 매개변수가 누락되었습니다.");
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          setClientInfo(data.data);
        } else {
          setError(data.message || "클라이언트 정보를 가져오는데 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error("Error fetching client info:", err);
        setError("클라이언트 정보를 가져오는데 실패했습니다.");
      })
      .finally(() => setLoading(false));
  }, [clientId, navigate, redirectUri, responseType, state, user]);

  const handleConsent = (approved: boolean) => {
    setLoading(true);
    
    fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth/consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("accessToken")}`,
      },
      body: JSON.stringify({
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        approved,
        scope,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Consent response:", data.status);
        if (data.status === 200 && data.data?.url) {
          window.location.href = data.data.url;
        } else {
          setError(data.message || "권한 부여 요청 처리 중 오류가 발생했습니다.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error during consent:", err);
        setError("권한 부여 요청 처리 중 오류가 발생했습니다.");
        setLoading(false);
      });
  };

  if (loading) {
    return <Container><LoadingText>로딩 중...</LoadingText></Container>;
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <h2>오류 발생</h2>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
        </ErrorContainer>
      </Container>
    );
  }

  const scopeItems = scope?.split(",").map((item) => item.trim()) || [];
  
  const scopeDescriptions: Record<string, string> = {
    email: "이메일 주소",
    nickname: "닉네임",
    role: "역할 (학생/교사)",
    major: "전공",
    admission: "입학년도",
    generation: "기수",
    isGraduated: "졸업 여부",
  };

  return (
    <Container>
      <ConsentContainer>
        <ServiceInfo>
          <Logo src={`https://logo.clearbit.com/${clientInfo?.serviceDomain}`} alt="서비스 로고" onError={(e) => {
            e.currentTarget.src = "/default-logo.png";
          }} />
          <h2>{clientInfo?.serviceName}</h2>
          <ServiceUrl>{clientInfo?.serviceDomain}</ServiceUrl>
        </ServiceInfo>

        <ConsentMessage>
          <strong>{clientInfo?.serviceName}</strong>에서 다음 정보에 접근하려고 합니다:
        </ConsentMessage>

        <ScopeList>
          {scopeItems.map((scopeItem) => (
            <ScopeItem key={scopeItem}>
              <ScopeIcon>✓</ScopeIcon>
              <div>
                <ScopeName>{scopeDescriptions[scopeItem] || scopeItem}</ScopeName>
                <ScopeDescription>
                  {scopeItem === "email" && "앱이 사용자의 학교 이메일 주소를 확인합니다."}
                  {scopeItem === "nickname" && "앱이 사용자의 닉네임을 사용합니다."}
                  {scopeItem === "role" && "앱이 사용자의 학교 내 역할(학생/교사)을 확인합니다."}
                  {scopeItem === "major" && "앱이 사용자의 전공 정보를 확인합니다."}
                  {scopeItem === "admission" && "앱이 사용자의 입학년도 정보를 확인합니다."}
                  {scopeItem === "generation" && "앱이 사용자의 기수 정보를 확인합니다."}
                  {scopeItem === "isGraduated" && "앱이 사용자의 졸업 여부를 확인합니다."}
                </ScopeDescription>
              </div>
            </ScopeItem>
          ))}
        </ScopeList>

        <PermissionText>
          권한 부여 후에도 설정에서 언제든지 접근 권한을 취소할 수 있습니다.
        </PermissionText>

        <ButtonGroup>
          <DenyButton onClick={() => handleConsent(false)}>거부</DenyButton>
          <ApproveButton onClick={() => handleConsent(true)}>허용</ApproveButton>
        </ButtonGroup>
      </ConsentContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ConsentContainer = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  text-align: center;
`;

const Logo = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 10px;
  margin-bottom: 10px;
  object-fit: contain;
`;

const ServiceUrl = styled.div`
  color: ${({ theme }) => theme.colors.secondaryText};
  margin-top: 5px;
  font-size: 14px;
`;

const ConsentMessage = styled.p`
  margin: 20px 0;
  font-size: 16px;
  line-height: 1.5;
`;

const ScopeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
`;

const ScopeItem = styled.li`
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ScopeIcon = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
`;

const ScopeName = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const ScopeDescription = styled.div`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 13px;
  margin-top: 3px;
`;

const PermissionText = styled.p`
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 13px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const ApproveButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  flex: 1;
  margin-left: 10px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const DenyButton = styled(Button)`
  background-color: white;
  color: ${({ theme }) => theme.colors.secondaryText};
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex: 1;
  margin-right: 10px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const LoadingText = styled.div`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const ErrorContainer = styled.div`
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin: 20px 0;
`;