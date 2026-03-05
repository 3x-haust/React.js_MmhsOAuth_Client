import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { getOAuthApps, deleteOAuthApp, refreshToken } from '@/features/oauth';

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
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState<OAuthApp | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { login, logout, setIsAuthModalOpen } = useAuthStore();

  const handleAuthRequired = useCallback(() => {
    logout();
    setIsAuthModalOpen(true);
    setError('로그인이 필요합니다.');
  }, [logout, setIsAuthModalOpen]);

  const isTokenExpired = (status?: number, message?: string) =>
    status === 401 || message === 'TOKEN_EXPIRED' || message === 'Token expired';

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOAuthApps();

      if (data.status === 200) {
        setApps(data.data || []);
      } else if (isTokenExpired(data.status, data.message)) {
        try {
          const refreshData = await refreshToken();
          login(refreshData.accessToken, refreshData.refreshToken);
          return fetchApps();
        } catch {
          handleAuthRequired();
          return;
        }
      } else {
        setError(data.message || '앱 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching OAuth apps:', err);
      setError('앱 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleAuthRequired, login]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleDeleteApp = async () => {
    if (!appToDelete) return;

    setDeleting(true);
    try {
      const data = await deleteOAuthApp(appToDelete.id);

      if (data.status === 200) {
        setApps(apps.filter(app => app.id !== appToDelete.id));
        setShowDeleteModal(false);
        setAppToDelete(null);
      } else if (isTokenExpired(data.status, data.message)) {
        try {
          const refreshData = await refreshToken();
          login(refreshData.accessToken, refreshData.refreshToken);
          return handleDeleteApp();
        } catch {
          handleAuthRequired();
          return;
        }
      } else {
        setError(data.message || '앱 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error deleting OAuth app:', err);
      setError('앱 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
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
      email: '이메일',
      nickname: '닉네임',
      role: '역할',
      major: '전공',
      admission: '입학년도',
      generation: '기수',
      isGraduated: '졸업 여부',
    };

    return scope
      .split(',')
      .map(s => scopeMap[s] || s)
      .join(', ');
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'all':
        return '전체 사용자';
      case 'student':
        return '학생만';
      case 'teacher':
        return '교사만';
      default:
        return type;
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>OAuth 애플리케이션 관리</Title>
        <Description>
          미림마이스터고 OAuth 서비스와 연동할 애플리케이션을 등록하고 관리하세요.
        </Description>
        <CreateButton onClick={() => navigate('/oauth/new')}>+ 새 애플리케이션 등록</CreateButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <AppsSection>
        {loading ? (
          <LoadingMessage>애플리케이션 목록을 불러오는 중...</LoadingMessage>
        ) : apps.length === 0 ? (
          <NoAppsMessage>
            <p>등록된 OAuth 애플리케이션이 없습니다.</p>
            <p>새 애플리케이션을 등록하여 미림마이스터고 OAuth 서비스를 활용해보세요!</p>
            <CreateButton onClick={() => navigate('/oauth/new')}>
              + 새 애플리케이션 등록
            </CreateButton>
          </NoAppsMessage>
        ) : (
          <AppGrid>
            {apps.map(app => (
              <AppCard key={app.id}>
                <AppHeader>
                  <AppLogo>
                    <img
                      src={getServiceLogo(app.serviceDomain)}
                      alt={`${app.serviceName} 로고`}
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/64?text=App';
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
                            alert('클라이언트 ID가 클립보드에 복사되었습니다.');
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
                        <SecretText>{app.clientSecret.substring(0, 8)}...</SecretText>
                        <CopyButton
                          onClick={() => {
                            navigator.clipboard.writeText(app.clientSecret);
                            alert('클라이언트 시크릿이 클립보드에 복사되었습니다.');
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
                    <DetailValue>{getUserTypeLabel(app.allowedUserType)}</DetailValue>
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
                      {new Date(app.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </DetailValue>
                  </DetailItem>
                </AppDetails>

                <AppActions>
                  <EditButton onClick={() => navigate(`/oauth/edit/${app.id}`)}>수정</EditButton>
                  <DeleteButton onClick={() => openDeleteModal(app)}>삭제</DeleteButton>
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
                <strong>{appToDelete.serviceName}</strong> 애플리케이션을 정말로 삭제하시겠습니까?
              </p>
              <p>이 작업은 되돌릴 수 없으며, 해당 애플리케이션의 모든 인증 정보가 삭제됩니다.</p>
            </ModalContent>
            <ModalActions>
              <CancelButton onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                취소
              </CancelButton>
              <ConfirmDeleteButton onClick={handleDeleteApp} disabled={deleting}>
                {deleting ? '삭제 중...' : '삭제'}
              </ConfirmDeleteButton>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const Header = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.secondaryText};
  margin-bottom: 12px;
`;

const CreateButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};
  padding: 0 14px;
  min-height: 38px;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const AppsSection = styled.div`
  margin-top: 2px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 32px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};
  padding: 12px 14px;
  border-radius: 10px;
`;

const NoAppsMessage = styled.div`
  text-align: center;
  padding: 44px 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;

  p {
    margin: 0 0 15px;
    color: ${({ theme }) => theme.colors.secondaryText};
    font-size: 0.9rem;

    &:first-child {
      font-size: 1rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
    }
  }

  ${CreateButton} {
    margin-top: 20px;
  }
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 1060px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AppCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  overflow: hidden;
`;

const AppHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const AppLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  background-color: ${({ theme }) => theme.colors.surface};
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
  font-size: 1.02rem;
  margin: 0 0 5px;
  color: ${({ theme }) => theme.colors.text};
`;

const AppDomain = styled.div`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const AppDetails = styled.div`
  padding: 14px 16px;
`;

const DetailItem = styled.div`
  margin-bottom: 12px;
  font-size: 0.86rem;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.mutedText};
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
`;

const SecretContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  border-radius: 10px;
`;

const SecretText = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CopyButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.74rem;
  margin-left: 8px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
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
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const ActionButton = styled.button`
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.82rem;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
`;

const EditButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  margin-right: 10px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};

  &:hover {
    background-color: ${({ theme }) => theme.colors.errorLight};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  width: 90%;
  max-width: 460px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1rem;
`;

const ModalContent = styled.div`
  padding: 16px;

  p {
    margin: 0 0 10px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.secondaryText};

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ModalActions = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const CancelButton = styled.button`
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 14px;
  min-height: 36px;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfirmDeleteButton = styled.button`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border: none;
  padding: 0 14px;
  min-height: 36px;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.errorDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
