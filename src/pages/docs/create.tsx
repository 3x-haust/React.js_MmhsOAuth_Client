import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuthStore } from '@/features/auth';
import {
  CreateDeveloperDocRequest,
  DeveloperDocService,
  UpdateDeveloperDocRequest,
} from '@/features/developer-doc';
import { DocForm } from '@/pages/docs/components/DocForm';

const CreateContainer = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const HeaderCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(1.2rem, 2vw, 1.55rem);
`;

const Description = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.86rem;
`;

const ErrorMessage = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.85rem;
`;

const FormWrapper = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 18px;
`;

export const CreateDocPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/docs', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (data: CreateDeveloperDocRequest | UpdateDeveloperDocRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const newDoc = await DeveloperDocService.createDoc(data as CreateDeveloperDocRequest);
      navigate(`/docs/${newDoc.id}`, { replace: true });
    } catch (createError) {
      setError('개발 문서 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error creating developer doc:', createError);
      setIsLoading(false);
    }
  };

  return (
    <CreateContainer>
      <HeaderCard>
        <PageTitle>새 개발 문서 작성</PageTitle>
        <Description>개발자용 문서 제목과 내용을 입력한 뒤 등록하세요.</Description>
      </HeaderCard>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormWrapper>
        <DocForm onSubmit={handleSubmit} isLoading={isLoading} />
      </FormWrapper>
    </CreateContainer>
  );
};
