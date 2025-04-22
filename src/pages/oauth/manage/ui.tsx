import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../../../features/auth";
import Cookies from "js-cookie";

interface OAuthApp {
  id: number;
  clientId: string;
  clientSecret: string;
  serviceName: string;
  serviceDomain: string;
  scope: string;
  redirectUris: string[];
  allowedUserType: string;
  createdAt: string;
}

export const ManageOAuthAppsPage = () => {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState<OAuthApp | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useAuthStore();

  const refreshToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({refreshToken: Cookies.get('refreshToken')}),
      });

      const data = await response.json();

      if (data.status === 200 && data.data?.accessToken) {
        Cookies.set('accessToken', data.data.accessToken, { secure: true, sameSite: 'Strict' });
        login(data.data.accessToken);
        return data.data.accessToken;
      } else {
        throw new Error(data.message || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      navigate('/login?redirect=/oauth/manage');
      return null;
    }
  };

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!user && !token) {
      navigate("/login?redirect=/oauth/manage");
      return;
    }

    fetchApps();
  }, [navigate, user]);

  const fetchApps = async() => {
    try {
      setLoading(true);
      const token = Cookies.get("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            credentials: "include",
          },
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        setApps(data.data || []);
      } else if (data.message === 'TOKEN_EXPIRED') {
        const newToken = await refreshToken();
        if (newToken) {
          return fetchApps();
        } else {
          navigate("/login?redirect=/oauth/manage");
        }
      } else {
        setError(data.message || "앱 목록을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("Error fetching OAuth apps:", err);
      setError("앱 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApp = async () => {
    if (!appToDelete) return;

    setDeleting(true);
    const deleteRequest = async (retryOnExpired = true) => {
      const token = Cookies.get("accessToken");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}/api/v1/oauth-client/${
            appToDelete.id
          }`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.status === 200) {
          setApps(apps.filter((app) => app.id !== appToDelete.id));
          setShowDeleteModal(false);
          setAppToDelete(null);
        } else if (data.message === 'TOKEN_EXPIRED' && retryOnExpired) {
          const newToken = await refreshToken();
          if (newToken) {
            return deleteRequest(false);
          } else {
            navigate("/login?redirect=/oauth/manage");
          }
        } else {
          setError(data.message || "앱 삭제에 실패했습니다.");
        }
      } catch (err) {
        console.error("Error deleting OAuth app:", err);
        setError("앱 삭제 중 오류가 발생했습니다.");
      } finally {
        setDeleting(false);
      }
    };

    await deleteRequest();
  };

  const openDeleteModal = (app: OAuthApp) => {
    setAppToDelete(app);
    setShowDeleteModal(true);
  };

  const getServiceLogo = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
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
      .join(", ");
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "all":
        return "전체 사용자";
      case "student":
        return "학생만";
      case "teacher":
        return "교사만";
      default:
        return type;
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>OAuth 애플리케이션 관리</Title>
        <Description>
          미림마이스터고 OAuth 서비스와 연동할 애플리케이션을 등록하고
          관리하세요.
        </Description>
        <CreateButton onClick={() => navigate("/oauth/new")}>
          + 새 애플리케이션 등록
        </CreateButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <AppsSection>
        {loading ? (
          <LoadingMessage>애플리케이션 목록을 불러오는 중...</LoadingMessage>
        ) : apps.length === 0 ? (
          <NoAppsMessage>
            <p>등록된 OAuth 애플리케이션이 없습니다.</p>
            <p>
              새 애플리케이션을 등록하여 미림마이스터고 OAuth 서비스를
              활용해보세요!
            </p>
            <CreateButton onClick={() => navigate("/oauth/new")}>
              + 새 애플리케이션 등록
            </CreateButton>
          </NoAppsMessage>
        ) : (
          <AppGrid>
            {apps.map((app) => (
              <AppCard key={app.id}>
                <AppHeader>
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
                    <AppDomain>{app.serviceDomain}</AppDomain>
                  </AppInfo>
                </AppHeader>

                <AppDetails>
                  <DetailItem>
                    <DetailLabel>클라이언트 ID</DetailLabel>
                    <DetailValue>
                      <SecretContainer>
                        <SecretText>{app.clientId}</SecretText>
                        <CopyButton
                          onClick={() => {
                            navigator.clipboard.writeText(app.clientId);
                            alert("클라이언트 ID가 클립보드에 복사되었습니다.");
                          }}
                        >
                          복사
                        </CopyButton>
                      </SecretContainer>
                    </DetailValue>
                  </DetailItem>

                  <DetailItem>
                    <DetailLabel>클라이언트 시크릿</DetailLabel>
                    <DetailValue>
                      <SecretContainer>
                        <SecretText>
                          {app.clientSecret.substring(0, 8)}...
                        </SecretText>
                        <CopyButton
                          onClick={() => {
                            navigator.clipboard.writeText(app.clientSecret);
                            alert(
                              "클라이언트 시크릿이 클립보드에 복사되었습니다."
                            );
                          }}
                        >
                          복사
                        </CopyButton>
                      </SecretContainer>
                    </DetailValue>
                  </DetailItem>

                  <DetailItem>
                    <DetailLabel>권한 범위</DetailLabel>
                    <DetailValue>{getScopeLabel(app.scope)}</DetailValue>
                  </DetailItem>

                  <DetailItem>
                    <DetailLabel>허용된 사용자</DetailLabel>
                    <DetailValue>
                      {getUserTypeLabel(app.allowedUserType)}
                    </DetailValue>
                  </DetailItem>

                  <DetailItem>
                    <DetailLabel>리디렉션 URL</DetailLabel>
                    <DetailValue>
                      <UrlList>
                        {app.redirectUris.map((uri, index) => (
                          <UrlItem key={index}>{uri}</UrlItem>
                        ))}
                      </UrlList>
                    </DetailValue>
                  </DetailItem>

                  <DetailItem>
                    <DetailLabel>생성일</DetailLabel>
                    <DetailValue>
                      {new Date(app.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </DetailValue>
                  </DetailItem>
                </AppDetails>

                <AppActions>
                  <EditButton onClick={() => navigate(`/oauth/edit/${app.id}`)}>
                    수정
                  </EditButton>
                  <DeleteButton onClick={() => openDeleteModal(app)}>
                    삭제
                  </DeleteButton>
                </AppActions>
              </AppCard>
            ))}
          </AppGrid>
        )}
      </AppsSection>

      {showDeleteModal && appToDelete && (
        <ModalOverlay>
          <Modal>
            <ModalTitle>애플리케이션 삭제</ModalTitle>
            <ModalContent>
              <p>
                <strong>{appToDelete.serviceName}</strong> 애플리케이션을 정말로
                삭제하시겠습니까?
              </p>
              <p>
                이 작업은 되돌릴 수 없으며, 해당 애플리케이션의 모든 인증 정보가
                삭제됩니다.
              </p>
            </ModalContent>
            <ModalActions>
              <CancelButton
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                취소
              </CancelButton>
              <ConfirmDeleteButton
                onClick={handleDeleteApp}
                disabled={deleting}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </ConfirmDeleteButton>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors?.text || "#333"};
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
  margin-bottom: 20px;
`;

const CreateButton = styled.button`
  background-color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || "#4B6ED3"};
  }
`;

const AppsSection = styled.div`
  margin-top: 30px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors?.errorLight || "#FFEBEE"};
  color: ${({ theme }) => theme.colors?.error || "#D32F2F"};
  padding: 15px 20px;
  border-radius: 6px;
  margin: 20px 0;
`;

const NoAppsMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  background-color: ${({ theme }) => theme.colors?.background || "#f5f5f5"};
  border-radius: 8px;

  p {
    margin: 0 0 15px;
    color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
    font-size: 16px;

    &:first-child {
      font-size: 18px;
      font-weight: 500;
      color: ${({ theme }) => theme.colors?.text || "#333"};
    }
  }

  ${CreateButton} {
    margin-top: 20px;
  }
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AppCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const AppHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors?.primaryLight || "#EEF1FD"};
`;

const AppLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  background-color: white;
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
  font-size: 18px;
  margin: 0 0 5px;
  color: ${({ theme }) => theme.colors?.text || "#333"};
`;

const AppDomain = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
`;

const AppDetails = styled.div`
  padding: 15px 20px;
`;

const DetailItem = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
`;

const DetailLabel = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors?.text || "#333"};
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors?.secondaryText || "#666"};
  word-break: break-all;
`;

const SecretContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors?.background || "#f5f5f5"};
  padding: 8px 12px;
  border-radius: 4px;
`;

const SecretText = styled.span`
  font-family: "Courier New", monospace;
  font-size: 13px;
`;

const CopyButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  border: 1px solid ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  margin-left: 8px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryLight || "#EEF1FD"};
  }
`;

const UrlList = styled.ul`
  margin: 0;
  padding-left: 18px;
`;

const UrlItem = styled.li`
  margin-bottom: 4px;
  word-break: break-all;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AppActions = styled.div`
  display: flex;
  padding: 15px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || "#eee"};
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
`;

const EditButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors?.primary || "#5E81F4"};
  color: white;
  border: none;
  margin-right: 10px;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || "#4B6ED3"};
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: white;
  color: ${({ theme }) => theme.colors?.error || "#D32F2F"};
  border: 1px solid ${({ theme }) => theme.colors?.error || "#D32F2F"};

  &:hover {
    background-color: ${({ theme }) => theme.colors?.errorLight || "#FFEBEE"};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || "#eee"};
  font-size: 18px;
`;

const ModalContent = styled.div`
  padding: 20px;

  p {
    margin: 0 0 15px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ModalActions = styled.div`
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || "#eee"};
`;

const CancelButton = styled.button`
  background-color: white;
  color: ${({ theme }) => theme.colors?.text || "#333"};
  border: 1px solid ${({ theme }) => theme.colors?.border || "#ddd"};
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors?.background || "#f5f5f5"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfirmDeleteButton = styled.button`
  background-color: ${({ theme }) => theme.colors?.error || "#D32F2F"};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors?.errorDark || "#B71C1C"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
