import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  Notice,
  CreateNoticeRequest,
  UpdateNoticeRequest,
} from '@/features/notice/api/noticeService';

interface NoticeFormProps {
  initialData?: Notice;
  onSubmit: (data: CreateNoticeRequest | UpdateNoticeRequest) => Promise<void>;
  isLoading: boolean;
}

const Form = styled.form`
  width: 100%;
  display: grid;
  gap: 14px;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 360px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.ring};
  }
`;

const CheckboxGroup = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.88rem;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const ButtonGroup = styled.div`
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  gap: 8px;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
`;

const BaseButton = styled.button`
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 700;
`;

const CancelButton = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    border-color: ${({ theme }) => theme.colors.cardBorder};
  }
`;

const SubmitButton = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const NoticeForm: React.FC<NoticeFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setIsActive(initialData.isActive);
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const formData: CreateNoticeRequest | UpdateNoticeRequest = {
      title,
      content,
    };

    if (initialData) {
      (formData as UpdateNoticeRequest).isActive = isActive;
    }

    try {
      await onSubmit(formData);
    } catch (submitError) {
      console.error('Form submission error:', submitError);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?')) {
      navigate('/notices');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor='title'>제목</Label>
        <Input
          id='title'
          type='text'
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder='제목을 입력하세요'
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor='content'>내용</Label>
        <Textarea
          id='content'
          value={content}
          onChange={event => setContent(event.target.value)}
          placeholder='내용을 입력하세요'
          required
        />
      </FormGroup>

      {initialData && (
        <FormGroup>
          <CheckboxGroup htmlFor='isActive'>
            <Checkbox
              id='isActive'
              type='checkbox'
              checked={isActive}
              onChange={event => setIsActive(event.target.checked)}
            />
            공개 상태 (활성화됨)
          </CheckboxGroup>
        </FormGroup>
      )}

      <ButtonGroup>
        <CancelButton type='button' onClick={handleCancel}>
          취소
        </CancelButton>
        <SubmitButton type='submit' disabled={isLoading}>
          {isLoading ? '저장 중...' : initialData ? '수정 완료' : '등록하기'}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
};
