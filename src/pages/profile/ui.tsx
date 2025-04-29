import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../../features/auth";
import {
  ConnectedApp,
  PermissionHistory,
  getConnectedApplications,
  getPermissionsHistory,
  revokeApplication,
  updateProfile,
} from "../../features/profile";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors?.text || "#333"};
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || "#e0e0e0"};
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${({ active }) => (active ? "600" : "400")};
  color: ${({ active, theme }) =>
    active ? theme.colors?.primary || "#5E81F4" : theme.colors?.text || "#333"};
  border-bottom: 2px solid
    ${({ active, theme }) =>
      active ? theme.colors?.primary || "#5E81F4" : "transparent"};

  &:hover {
    color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text || "#333"};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || "#e0e0e0"};
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || "#4A67C7"};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors?.disabled || "#cccccc"};
    cursor: not-allowed;
  }
`;

const DangerButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors?.error || "#dc3545"};

  &:hover {
    background-color: ${({ theme }) => theme.colors?.errorDark || "#bd2130"};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  border: 1px solid ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryLight || "#EEF1FD"};
  }
`;

const Message = styled.div<{ type: "success" | "error" }>`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: ${({ type, theme }) =>
    type === "success"
      ? theme.colors?.successLight || "#d4edda"
      : theme.colors?.errorLight || "#f8d7da"};
  color: ${({ type, theme }) =>
    type === "success"
      ? theme.colors?.success || "#28a745"
      : theme.colors?.error || "#dc3545"};
`;

const AppCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || "#e0e0e0"};
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const AppLogo = styled.div`
  width: 48px;
  height: 48px;
  margin-right: 1rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors?.primaryLight || "#EEF1FD"};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const AppInfo = styled.div`
  flex: 1;
`;

const AppName = styled.h3`
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
`;

const AppDetail = styled.p`
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
`;

const AppActions = styled.div`
  margin-left: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || "#e0e0e0"};
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
  font-weight: 500;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || "#e0e0e0"};
`;

const Badge = styled.span<{ type: "active" | "revoked" }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ type, theme }) =>
    type === "active"
      ? theme.colors?.successLight || "#d4edda"
      : theme.colors?.errorLight || "#f8d7da"};
  color: ${({ type, theme }) =>
    type === "active"
      ? theme.colors?.success || "#28a745"
      : theme.colors?.error || "#dc3545"};
`;

const ScopesList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ScopeItem = styled.li`
  display: inline-block;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: ${({ theme }) => theme.colors?.primaryLight || "#EEF1FD"};
  color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  border-radius: 4px;
  font-size: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
`;

const ProfileInfoRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
`;

const ProfileLabel = styled.div`
  font-weight: 500;
  width: 120px;
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
`;

const ProfileValue = styled.div`
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "applications" | "permissions"
  >("profile");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [history, setHistory] = useState<PermissionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab");
    if (tab === "applications" || tab === "permissions" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setNickname(user.nickname || "");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "applications") {
      fetchConnectedApps();
    } else if (activeTab === "permissions") {
      fetchPermissionsHistory();
    }
  }, [activeTab]);

  const fetchConnectedApps = async () => {
    try {
      setIsLoading(true);
      const response = await getConnectedApplications();
      if (response.status === 200 && response.data) {
        setApps(response.data.filter((app) => app.revokedAt === null));
      }
    } catch (error) {
      console.error("Failed to fetch connected applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissionsHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getPermissionsHistory();
      if (response.status === 200 && response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch permissions history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeApp = async (clientId: string) => {
    try {
      setIsRevoking(clientId);
      const response = await revokeApplication(clientId);
      if (response.status === 200) {
        setApps(apps.filter((app) => app.clientId !== clientId));
        fetchPermissionsHistory();
      }
    } catch (error) {
      console.error("Failed to revoke application:", error);
    } finally {
      setIsRevoking(null);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword.length < 8) {
      setMessage({ type: "error", text: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." });
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData = {
        nickname: nickname !== user?.nickname ? nickname : undefined,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      };

      const response = await updateProfile(updateData);

      if (response.status === 200) {
        setMessage({
          type: "success",
          text: "프로필이 성공적으로 업데이트되었습니다.",
        });
        await refreshUser();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: response.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "프로필 업데이트 중 오류가 발생했습니다.",
      });
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setNickname(user.nickname || "");
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(null);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScopeLabel = (scope: string) => {
    const scopeMap: { [key: string]: string } = {
      email: "이메일",
      nickname: "닉네임",
      role: "역할",
      major: "전공",
      admission: "입학년도",
      generation: "기수",
      isGraduated: "졸업 여부",
    };

    return scope
      .split(",")
      .map((s) => scopeMap[s] || s)
      .filter(Boolean);
  };

  const getServiceLogo = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  return (
    <Container>
      <Title>마이페이지</Title>

      <TabContainer>
        <Tab
          active={activeTab === "profile"}
          onClick={() => {
            setActiveTab("profile");
            navigate("?tab=profile");
          }}
        >
          프로필 정보
        </Tab>
        <Tab
          active={activeTab === "applications"}
          onClick={() => {
            setActiveTab("applications");
            navigate("?tab=applications");
          }}
        >
          연결된 애플리케이션
        </Tab>
        <Tab
          active={activeTab === "permissions"}
          onClick={() => {
            setActiveTab("permissions");
            navigate("?tab=permissions");
          }}
        >
          권한 내역
        </Tab>
      </TabContainer>

      {activeTab === "profile" && (
        <Card>
          {message && <Message type={message.type}>{message.text}</Message>}
          
          {!isEditing ? (
            <>
              <ProfileInfoRow>
                <ProfileLabel>이메일</ProfileLabel>
                <ProfileValue>{email}</ProfileValue>
              </ProfileInfoRow>
              <ProfileInfoRow>
                <ProfileLabel>닉네임</ProfileLabel>
                <ProfileValue>{nickname}</ProfileValue>
              </ProfileInfoRow>
              {user?.major && (
                <ProfileInfoRow>
                  <ProfileLabel>전공</ProfileLabel>
                  <ProfileValue>{user.major}</ProfileValue>
                </ProfileInfoRow>
              )}
              {user?.admission && (
                <ProfileInfoRow>
                  <ProfileLabel>입학년도</ProfileLabel>
                  <ProfileValue>{user.admission}</ProfileValue>
                </ProfileInfoRow>
              )}
              {user?.generation && (
                <ProfileInfoRow>
                  <ProfileLabel>기수</ProfileLabel>
                  <ProfileValue>{user.generation}</ProfileValue>
                </ProfileInfoRow>
              )}
              {user?.isGraduated !== undefined && (
                <ProfileInfoRow>
                  <ProfileLabel>졸업 여부</ProfileLabel>
                  <ProfileValue>
                    {user.isGraduated ? "졸업" : "재학 중"}
                  </ProfileValue>
                </ProfileInfoRow>
              )}
              
              <ButtonGroup>
                <Button onClick={() => setIsEditing(true)}>프로필 수정</Button>
              </ButtonGroup>
            </>
          ) : (
            <form onSubmit={handleProfileUpdate}>
              <FormGroup>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="비밀번호를 변경하려면 입력하세요"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="newPassword">새 비밀번호 (8자 이상)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호"
                  minLength={8}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 확인"
                />
              </FormGroup>

              <ButtonGroup>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : "변경사항 저장"}
                </Button>
                <SecondaryButton type="button" onClick={handleCancelEdit}>
                  취소
                </SecondaryButton>
              </ButtonGroup>
            </form>
          )}
        </Card>
      )}

      {activeTab === "applications" && (
        <Card>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : apps.length === 0 ? (
            <EmptyState>연결된 애플리케이션이 없습니다.</EmptyState>
          ) : (
            apps.map((app) => (
              <AppCard key={app.clientId}>
                <AppLogo>
                  <img
                    src={getServiceLogo(app.serviceDomain)}
                    alt={`${app.serviceName} 로고`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/64?text=App";
                    }}
                  />
                </AppLogo>
                <AppInfo>
                  <AppName>{app.serviceName}</AppName>
                  <AppDetail>{app.serviceDomain}</AppDetail>
                  <AppDetail>연결일: {formatDate(app.grantedAt)}</AppDetail>
                  <ScopesList>
                    {getScopeLabel(app.scope).map((scope, index) => (
                      <ScopeItem key={index}>{scope}</ScopeItem>
                    ))}
                  </ScopesList>
                </AppInfo>
                <AppActions>
                  <DangerButton
                    onClick={() => handleRevokeApp(app.clientId)}
                    disabled={isRevoking === app.clientId}
                  >
                    {isRevoking === app.clientId ? "해제 중..." : "연결 해제"}
                  </DangerButton>
                </AppActions>
              </AppCard>
            ))
          )}
        </Card>
      )}

      {activeTab === "permissions" && (
        <Card>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : history.length === 0 ? (
            <EmptyState>권한 내역이 없습니다.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>애플리케이션</Th>
                  <Th>권한 범위</Th>
                  <Th>일시</Th>
                  <Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <Td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={getServiceLogo(item.applicationDomain)}
                          alt={`${item.applicationDomain} 로고`}
                          width={24}
                          style={{ marginRight: "8px" }}
                        />
                        {item.applicationName}
                      </div>
                    </Td>
                    <Td>
                      <ScopesList>
                        {getScopeLabel(item.permissionScopes).map((scope, index) => (
                          <ScopeItem key={index}>{scope}</ScopeItem>
                        ))}
                      </ScopesList>
                    </Td>
                    <Td>{formatDate(item.timestamp)}</Td>
                    <Td>
                      <Badge
                        type={item.status === "active" ? "active" : "revoked"}
                      >
                        {item.status === "active" ? "활성" : "취소됨"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </Container>
  );
}

export default ProfilePage;