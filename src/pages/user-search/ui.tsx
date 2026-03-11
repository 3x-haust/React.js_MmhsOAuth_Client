import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import { executeWithTokenRefresh } from '@/features/auth/api/authService';
import { API_URL } from '@/shared/api/constants';

type SearchUser = {
  id: number;
  nickname: string;
  email: string;
  profileImageUrl?: string | null;
  role?: string;
  major?: string;
  admission?: number | string;
  generation?: number | string;
  isGraduated?: boolean;
  isAdmin?: boolean;
};

const Container = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const Card = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 18px;
`;

const Label = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.mutedText};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.95rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const Info = styled.p<{ $error?: boolean }>`
  margin-top: 10px;
  color: ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.secondaryText)};
  font-size: 0.85rem;
`;

const UserList = styled.ul`
  margin-top: 12px;
  display: grid;
  gap: 9px;
`;

const UserItem = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: 10px;
  overflow: hidden;
`;

const UserSummaryRow = styled.div`
  width: 100%;
  min-height: 66px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
`;

const UserLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.83rem;
  font-weight: 700;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UserText = styled.div`
  min-width: 0;
  display: grid;
  gap: 4px;
`;

const UserName = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BadgeGroup = styled.div`
  display: inline-flex;
  gap: 6px;
  align-items: center;
`;

const OpenDetailLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.74rem;
  font-weight: 600;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  background: ${({ theme }) => theme.colors.warningLight};
  color: ${({ theme }) => theme.colors.warning};
`;

const UserMeta = styled.p`
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.82rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DetailGrid = styled.dl`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 680px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const DetailItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 8px 10px;
`;

const DetailLabel = styled.dt`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.mutedText};
`;

const DetailValue = styled.dd`
  margin-top: 4px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.45;
`;

const BackLink = styled(Link)`
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.78rem;
  font-weight: 600;
`;

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (raw.user && typeof raw.user === 'object') {
    return { ...raw, ...(raw.user as Record<string, unknown>) };
  }
  return raw;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return undefined;
};

const normalizeUser = (payload: unknown): SearchUser | null => {
  const candidate = toRecord(payload);
  if (!candidate) return null;

  const id = toNumber(candidate.id ?? candidate.userId);
  const nickname = toStringValue(candidate.nickname ?? candidate.name);

  if (id === null || !nickname) {
    return null;
  }

  return {
    id,
    nickname,
    email: toStringValue(candidate.email) ?? '',
    profileImageUrl:
      toStringValue(
        candidate.profileImageUrl ??
          candidate.avatarUrl ??
          candidate.profileImage ??
          candidate.imageUrl
      ) ?? null,
    role: toStringValue(candidate.role),
    major: toStringValue(candidate.major),
    admission: toStringValue(candidate.admission) ?? toNumber(candidate.admission) ?? undefined,
    generation: toStringValue(candidate.generation) ?? toNumber(candidate.generation) ?? undefined,
    isGraduated: toBoolean(candidate.isGraduated),
    isAdmin: toBoolean(candidate.isAdmin),
  };
};

const normalizeUsers = (payload: unknown): SearchUser[] => {
  if (!payload) return [];

  const bucket: SearchUser[] = [];

  if (Array.isArray(payload)) {
    payload.forEach(item => {
      const normalized = normalizeUser(item);
      if (normalized) {
        bucket.push(normalized);
      }
    });
  } else {
    const candidate = toRecord(payload);
    if (candidate) {
      const nestedKeys = ['users', 'items', 'results', 'list', 'rows'];
      nestedKeys.forEach(key => {
        const nested = candidate[key];
        if (Array.isArray(nested)) {
          nested.forEach(item => {
            const normalized = normalizeUser(item);
            if (normalized) {
              bucket.push(normalized);
            }
          });
        }
      });

      const single = normalizeUser(candidate);
      if (single) {
        bucket.push(single);
      }
    }
  }

  const deduped = new Map<string, SearchUser>();
  bucket.forEach(item => {
    deduped.set(`${item.id}-${item.nickname}`, item);
  });

  return [...deduped.values()];
};

const searchUsers = async (keyword: string): Promise<SearchUser[]> => {
  return executeWithTokenRefresh(async token => {
    if (!token) return [];

    const encodedKeyword = encodeURIComponent(keyword);
    const endpoint = `${API_URL}/api/v1/user/search?query=${encodedKeyword}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = (await response.json()) as { message?: string; data?: unknown };

      if (result?.message === 'TOKEN_EXPIRED') {
        throw new Error('TOKEN_EXPIRED');
      }

      if (!response.ok) {
        return [];
      }

      return normalizeUsers(result?.data ?? result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('TOKEN_EXPIRED')) {
        throw error;
      }
    }

    return [];
  });
};

const getRoleLabel = (role?: string): string => {
  if (!role) return '-';
  if (role === 'student') return '학생';
  if (role === 'teacher') return '교사';
  return role;
};

const getMajorLabel = (major?: string): string => {
  if (!major) return '-';
  if (major === 'software') return '소프트웨어';
  if (major === 'design') return '디자인';
  if (major === 'web') return '웹';
  return major;
};

const getBoolLabel = (value: boolean | undefined, trueText: string, falseText: string): string => {
  if (value === undefined) return '-';
  return value ? trueText : falseText;
};

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

const toDisplayValue = (value: string | number | undefined): string => {
  if (value === undefined || value === '') return '-';
  return String(value);
};

const getAvatarText = (nickname?: string): string => {
  if (!nickname) return 'G';
  const trimmed = nickname.trim();
  if (!trimmed) return 'G';
  return trimmed.slice(0, 1).toUpperCase();
};

const encodeDetailPayload = (target: SearchUser): string => {
  try {
    const payload = JSON.stringify({
      id: target.id,
      nickname: target.nickname,
      email: target.email,
      profileImageUrl: target.profileImageUrl ?? null,
      role: target.role,
      major: target.major,
      admission: target.admission,
      generation: target.generation,
      isGraduated: target.isGraduated,
      isAdmin: target.isAdmin,
    });
    const encodedBytes = new TextEncoder().encode(payload);
    const binary = Array.from(encodedBytes)
      .map(byte => String.fromCharCode(byte))
      .join('');
    return btoa(binary);
  } catch {
    return '';
  }
};

const decodeDetailPayload = (encodedPayload: string | null): SearchUser | null => {
  if (!encodedPayload) {
    return null;
  }
  try {
    const binary = atob(encodedPayload);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    return normalizeUser(parsed);
  } catch {
    return null;
  }
};

const getDetailHref = (target: SearchUser): string => {
  const payload = encodeDetailPayload(target);
  if (!payload) {
    return '/user-search';
  }
  return `/user-search/detail?data=${encodeURIComponent(payload)}`;
};

export const UserSearchPage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const keyword = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!isLoggedIn) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (keyword === '') {
      setResults([]);
      setError('');
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const users = await searchUsers(keyword);
        setResults(users.slice(0, 10));
      } catch (searchError) {
        console.error(searchError);
        setError('검색 결과를 불러오지 못했습니다.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoggedIn, keyword]);

  return (
    <Container>
      <Card>
        <Label>검색할 유저의 닉네임 또는 이메일</Label>
        <Input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='닉네임 또는 이메일을 입력하세요'
        />

        {!isLoggedIn && <Info $error>로그인 후 사용할 수 있습니다.</Info>}
        {isLoggedIn && loading && <Info>유저 데이터를 불러오는 중입니다.</Info>}
        {error && <Info $error>{error}</Info>}

        {keyword !== '' && isLoggedIn && !loading && !error && results.length === 0 && (
          <Info>해당 닉네임의 유저를 찾을 수 없습니다.</Info>
        )}

        {results.length > 0 && (
          <UserList>
            {results.map(target => {
              const userKey = `${target.id}-${target.nickname}`;
              const profileImageUrl = resolveProfileImageUrl(target.profileImageUrl);
              const detailHref = getDetailHref(target);

              return (
                <UserItem key={userKey}>
                  <UserSummaryRow>
                    <UserLeft>
                      <Avatar>
                        {profileImageUrl ? (
                          <AvatarImage src={profileImageUrl} alt={`${target.nickname} 프로필`} />
                        ) : (
                          <span>{getAvatarText(target.nickname)}</span>
                        )}
                      </Avatar>

                      <UserText>
                        <UserName>{target.nickname}</UserName>
                        <UserMeta>{target.email || '이메일 정보 없음'}</UserMeta>
                      </UserText>
                    </UserLeft>

                    <BadgeGroup>
                      {target.isAdmin && <Badge>관리자</Badge>}
                      <OpenDetailLink to={detailHref}>세부사항</OpenDetailLink>
                    </BadgeGroup>
                  </UserSummaryRow>
                </UserItem>
              );
            })}
          </UserList>
        )}
      </Card>
    </Container>
  );
};

export const UserSearchDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const target = useMemo(() => decodeDetailPayload(searchParams.get('data')), [searchParams]);
  const profileImageUrl = resolveProfileImageUrl(target?.profileImageUrl);

  return (
    <Container>
      <Card>
        <Label>유저 세부사항</Label>
        {!target && (
          <Info $error>세부사항을 불러오지 못했습니다. 유저 검색에서 다시 열어주세요.</Info>
        )}

        {target && (
          <>
            <UserSummaryRow>
              <UserLeft>
                <Avatar>
                  {profileImageUrl ? (
                    <AvatarImage src={profileImageUrl} alt={`${target.nickname} 프로필`} />
                  ) : (
                    <span>{getAvatarText(target.nickname)}</span>
                  )}
                </Avatar>

                <UserText>
                  <UserName>{target.nickname}</UserName>
                  <UserMeta>{target.email || '이메일 정보 없음'}</UserMeta>
                </UserText>
              </UserLeft>

              <BadgeGroup>{target.isAdmin && <Badge>관리자</Badge>}</BadgeGroup>
            </UserSummaryRow>

            <DetailGrid>
              <DetailItem>
                <DetailLabel>역할</DetailLabel>
                <DetailValue>{getRoleLabel(target.role)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>전공</DetailLabel>
                <DetailValue>{getMajorLabel(target.major)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>입학년도</DetailLabel>
                <DetailValue>{toDisplayValue(target.admission)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>기수</DetailLabel>
                <DetailValue>{toDisplayValue(target.generation)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>졸업 여부</DetailLabel>
                <DetailValue>{getBoolLabel(target.isGraduated, '졸업', '재학')}</DetailValue>
              </DetailItem>
            </DetailGrid>
          </>
        )}

        <BackLink to='/user-search'>유저 검색으로 돌아가기</BackLink>
      </Card>
    </Container>
  );
};
