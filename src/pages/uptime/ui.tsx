import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { API_URL } from '@/shared/api/constants';

type StatusType = 'online' | 'degraded' | 'offline';

type ServiceStatus = {
  name: string;
  endpoint: string;
  status: StatusType;
  detail: string;
};

const Container = styled.div`
  max-width: 980px;
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

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const StatusItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  padding: 12px;
`;

const StatusName = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 700;
`;

const StatusBadge = styled.span<{ $status: StatusType }>`
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 3px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${({ theme, $status }) => {
    if ($status === 'online') return theme.colors.success;
    if ($status === 'degraded') return theme.colors.warning;
    return theme.colors.error;
  }};
  background: ${({ theme, $status }) => {
    if ($status === 'online') return theme.colors.successLight;
    if ($status === 'degraded') return theme.colors.warningLight;
    return theme.colors.errorLight;
  }};
`;

const StatusDetail = styled.p`
  margin-top: 8px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.secondaryText};
  word-break: break-all;
`;

const ExternalLink = styled.a`
  margin-top: 10px;
  display: inline-flex;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.82rem;
  font-weight: 600;
`;

const fetchStatus = async (name: string, endpoint: string): Promise<ServiceStatus> => {
  try {
    const response = await fetch(endpoint, { method: 'GET' });
    if (response.status >= 200 && response.status < 400) {
      return { name, endpoint, status: 'online', detail: `HTTP ${response.status}` };
    }
    return { name, endpoint, status: 'degraded', detail: `HTTP ${response.status}` };
  } catch (error) {
    console.error(error);
    return { name, endpoint, status: 'offline', detail: '요청 실패 또는 CORS 제한' };
  }
};

export const UptimePage: React.FC = () => {
  const [statusList, setStatusList] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runCheck = async () => {
      setLoading(true);
      const checks = await Promise.all([
        fetchStatus('Frontend', window.location.origin),
        fetchStatus('OAuth API', `${API_URL}/api/v1/notice?includeInactive=false`),
      ]);
      setStatusList(checks);
      setLoading(false);
    };

    runCheck();
  }, []);

  return (
    <Container>
      <Card>
        <StatusGrid>
          {loading && <StatusItem>상태를 확인하는 중입니다.</StatusItem>}
          {!loading &&
            statusList.map(item => (
              <StatusItem key={item.name}>
                <StatusName>{item.name}</StatusName>
                <StatusBadge $status={item.status}>{item.status.toUpperCase()}</StatusBadge>
                <StatusDetail>{item.detail}</StatusDetail>
                <StatusDetail>{item.endpoint}</StatusDetail>
              </StatusItem>
            ))}
        </StatusGrid>

        <ExternalLink href='https://status.bssm.app/status/bsm' target='_blank' rel='noreferrer'>
          MMHS 상태 페이지 열기
        </ExternalLink>
      </Card>
    </Container>
  );
};
