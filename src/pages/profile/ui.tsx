import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import {
  ConnectedApp,
  PermissionHistory,
  deleteProfileImage,
  getConnectedApplications,
  getPermissionsHistory,
  revokeApplication,
  uploadProfileImage,
  updateProfile,
} from '@/features/profile';
import { API_URL } from '@/shared/api/constants';

const Container = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 10px;
  overflow-x: auto;
`;

const Tab = styled.button<{ $active: boolean }>`
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.cardBorder : theme.colors.border)};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceElevated : theme.colors.surface};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.secondaryText)};
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.cardBorder};
  }
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 1.25rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.45rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const DangerButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.error};

  &:hover {
    background-color: ${({ theme }) => theme.colors.errorDark};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 0.8rem 0.9rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  background-color: ${({ type, theme }) =>
    type === 'success' ? theme.colors.successLight : theme.colors.errorLight};
  color: ${({ type, theme }) => (type === 'success' ? theme.colors.success : theme.colors.error)};
`;

const AppCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

const AppLogo = styled.div`
  width: 48px;
  height: 48px;
  margin-right: 1rem;
  border-radius: 10px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.primaryLight};
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
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const AppActions = styled.div`
  margin-left: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.secondaryText};
  font-weight: 500;
  font-size: 0.82rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

const Td = styled.td`
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.86rem;
`;

const Badge = styled.span<{ type: 'active' | 'revoked' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background-color: ${({ type, theme }) =>
    type === 'active' ? theme.colors.successLight : theme.colors.errorLight};
  color: ${({ type, theme }) => (type === 'active' ? theme.colors.success : theme.colors.error)};
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
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  font-size: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const ProfileInfoRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
`;

const ProfileLabel = styled.div`
  font-weight: 500;
  width: 120px;
  color: ${({ theme }) => theme.colors.secondaryText};
`;

const ProfileValue = styled.div`
  flex: 1;
`;

const ProfileImageSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProfileImagePreview = styled.div`
  width: 76px;
  height: 76px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.15rem;
  font-weight: 700;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileImageMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const ProfileImageHint = styled.p`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.8rem;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
`;

const ApplicationCell = styled.div`
  display: flex;
  align-items: center;
`;

const ApplicationIcon = styled.img`
  width: 24px;
  margin-right: 8px;
`;

const resolveProfileImageUrl = (profileImageUrl?: string | null): string | null => {
  if (!profileImageUrl) return null;
  if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
    return profileImageUrl;
  }
  if (profileImageUrl.startsWith('/')) {
    return `${API_URL}${profileImageUrl}`;
  }
  return `${API_URL}/${profileImageUrl}`;
};

const convertToWebpAvatar = async (file: File): Promise<File> => {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const target = new Image();
      target.onload = () => resolve(target);
      target.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
      target.src = imageUrl;
    });

    const maxSide = 256;
    const ratio = Math.min(maxSide / image.width, maxSide / image.height, 1);
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('이미지 처리에 실패했습니다.');
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        result => {
          if (!result) {
            reject(new Error('이미지 압축에 실패했습니다.'));
            return;
          }
          resolve(result);
        },
        'image/webp',
        0.78
      );
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'avatar';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'permissions'>('profile');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [history, setHistory] = useState<PermissionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isAvatarDeleting, setIsAvatarDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const profileImageUrl = resolveProfileImageUrl(user?.profileImageUrl);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    if (tab === 'applications' || tab === 'permissions' || tab === 'profile') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setNickname(user.nickname || '');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchConnectedApps();
    } else if (activeTab === 'permissions') {
      fetchPermissionsHistory();
    }
  }, [activeTab]);

  const fetchConnectedApps = async () => {
    try {
      setIsLoading(true);
      const response = await getConnectedApplications();
      if (response.status === 200 && response.data) {
        setApps(response.data.filter(app => app.revokedAt === null));
      }
    } catch (error) {
      console.error('Failed to fetch connected applications:', error);
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
      console.error('Failed to fetch permissions history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeApp = async (clientId: string) => {
    try {
      setIsRevoking(clientId);
      const response = await revokeApplication(clientId);
      if (response.status === 200) {
        setApps(apps.filter(app => app.clientId !== clientId));
        fetchPermissionsHistory();
      }
    } catch (error) {
      console.error('Failed to revoke application:', error);
    } finally {
      setIsRevoking(null);
    }
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = event.target.files?.[0];
    event.target.value = '';

    if (!targetFile) {
      return;
    }

    if (!targetFile.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '이미지 파일만 업로드할 수 있습니다.' });
      return;
    }

    try {
      setIsAvatarUploading(true);
      setMessage(null);
      const optimizedFile = await convertToWebpAvatar(targetFile);

      if (optimizedFile.size > 350 * 1024) {
        setMessage({
          type: 'error',
          text: '이미지 용량이 큽니다. 다른 이미지를 선택해주세요.',
        });
        return;
      }

      const response = await uploadProfileImage(optimizedFile);
      if (response.status === 200) {
        await refreshUser();
        setMessage({ type: 'success', text: '프로필 이미지가 업데이트되었습니다.' });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      setMessage({ type: 'error', text: '프로필 이미지 업로드에 실패했습니다.' });
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setIsAvatarDeleting(true);
      setMessage(null);
      const response = await deleteProfileImage();
      if (response.status === 200) {
        await refreshUser();
        setMessage({ type: 'success', text: '프로필 이미지가 삭제되었습니다.' });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      console.error('Failed to delete profile image:', error);
      setMessage({ type: 'error', text: '프로필 이미지 삭제에 실패했습니다.' });
    } finally {
      setIsAvatarDeleting(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
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
          type: 'success',
          text: '프로필이 성공적으로 업데이트되었습니다.',
        });
        await refreshUser();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '프로필 업데이트 중 오류가 발생했습니다.',
      });
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setNickname(user.nickname || '');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          $active={activeTab === 'profile'}
          onClick={() => {
            setActiveTab('profile');
            navigate('?tab=profile');
          }}
        >
          프로필 정보
        </Tab>
        <Tab
          $active={activeTab === 'applications'}
          onClick={() => {
            setActiveTab('applications');
            navigate('?tab=applications');
          }}
        >
          연결된 애플리케이션
        </Tab>
        <Tab
          $active={activeTab === 'permissions'}
          onClick={() => {
            setActiveTab('permissions');
            navigate('?tab=permissions');
          }}
        >
          권한 내역
        </Tab>
      </TabContainer>

      {activeTab === 'profile' && (
        <Card>
          <HiddenFileInput
            ref={fileInputRef}
            type='file'
            accept='image/png,image/jpeg,image/webp'
            onChange={handleAvatarFileChange}
          />

          <ProfileImageSection>
            <ProfileImagePreview>
              {profileImageUrl ? (
                <ProfileImage src={profileImageUrl} alt='프로필 이미지' />
              ) : (
                <span>{(nickname || user?.nickname || 'G').slice(0, 1).toUpperCase()}</span>
              )}
            </ProfileImagePreview>
            <ProfileImageMeta>
              <ProfileImageHint>프로필 이미지는 WEBP로 압축되어 저장됩니다.</ProfileImageHint>
              <ButtonGroup>
                <Button
                  type='button'
                  onClick={handleAvatarUploadClick}
                  disabled={isAvatarUploading || isAvatarDeleting}
                >
                  {isAvatarUploading ? '업로드 중...' : '이미지 업로드'}
                </Button>
                <SecondaryButton
                  type='button'
                  onClick={handleAvatarDelete}
                  disabled={!profileImageUrl || isAvatarUploading || isAvatarDeleting}
                >
                  {isAvatarDeleting ? '삭제 중...' : '이미지 삭제'}
                </SecondaryButton>
              </ButtonGroup>
            </ProfileImageMeta>
          </ProfileImageSection>

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
                  <ProfileValue>{user.isGraduated ? '졸업' : '재학 중'}</ProfileValue>
                </ProfileInfoRow>
              )}

              <ButtonGroup>
                <Button onClick={() => setIsEditing(true)}>프로필 수정</Button>
              </ButtonGroup>
            </>
          ) : (
            <form onSubmit={handleProfileUpdate}>
              <FormGroup>
                <Label htmlFor='email'>이메일</Label>
                <Input id='email' type='email' value={email} disabled />
              </FormGroup>

              <FormGroup>
                <Label htmlFor='nickname'>닉네임</Label>
                <Input
                  id='nickname'
                  type='text'
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor='currentPassword'>현재 비밀번호</Label>
                <Input
                  id='currentPassword'
                  type='password'
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder='비밀번호를 변경하려면 입력하세요'
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor='newPassword'>새 비밀번호 (8자 이상)</Label>
                <Input
                  id='newPassword'
                  type='password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder='새 비밀번호'
                  minLength={8}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor='confirmPassword'>비밀번호 확인</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder='새 비밀번호 확인'
                />
              </FormGroup>

              <ButtonGroup>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? '저장 중...' : '변경사항 저장'}
                </Button>
                <SecondaryButton type='button' onClick={handleCancelEdit}>
                  취소
                </SecondaryButton>
              </ButtonGroup>
            </form>
          )}
        </Card>
      )}

      {activeTab === 'applications' && (
        <Card>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : apps.length === 0 ? (
            <EmptyState>연결된 애플리케이션이 없습니다.</EmptyState>
          ) : (
            apps.map(app => (
              <AppCard key={app.clientId}>
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
                    {isRevoking === app.clientId ? '해제 중...' : '연결 해제'}
                  </DangerButton>
                </AppActions>
              </AppCard>
            ))
          )}
        </Card>
      )}

      {activeTab === 'permissions' && (
        <Card>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : history.length === 0 ? (
            <EmptyState>권한 내역이 없습니다.</EmptyState>
          ) : (
            <TableWrap>
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
                  {history.map(item => (
                    <tr key={item.id}>
                      <Td>
                        <ApplicationCell>
                          <ApplicationIcon
                            src={getServiceLogo(item.applicationDomain)}
                            alt={`${item.applicationDomain} 로고`}
                          />
                          {item.applicationName}
                        </ApplicationCell>
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
                        <Badge type={item.status === 'active' ? 'active' : 'revoked'}>
                          {item.status === 'active' ? '활성' : '취소됨'}
                        </Badge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </Card>
      )}
    </Container>
  );
}

export default ProfilePage;
