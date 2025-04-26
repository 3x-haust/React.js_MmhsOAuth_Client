import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Notice, CreateNoticeRequest, UpdateNoticeRequest } from '../../../features/notice/api/noticeService';

interface NoticeFormProps {
  initialData?: Notice;
  onSubmit: (data: CreateNoticeRequest | UpdateNoticeRequest) => Promise<void>;
  isLoading: boolean;
}

const Form = styled.form`
  max-width: 900px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
    box-shadow: 0 0 0 2px rgba(94, 129, 244, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
    box-shadow: 0 0 0 2px rgba(94, 129, 244, 0.2);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors?.background || '#f5f5f5'};
  color: ${({ theme }) => theme.colors?.text || '#333'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors?.border || '#eee'};
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors?.primaryDark || '#4B6ED3'};
  }
  
  &:disabled {
    opacity: 0.7;
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    const formData: CreateNoticeRequest | UpdateNoticeRequest = {
      title,
      content
    };
    
    if (initialData) {
      (formData as UpdateNoticeRequest).isActive = isActive;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
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
        <Label htmlFor="title">제목</Label>
        <Input 
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="content">내용</Label>
        <Textarea 
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          required
        />
      </FormGroup>
      
      {initialData && (
        <FormGroup>
          <CheckboxGroup>
            <Checkbox 
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <CheckboxLabel htmlFor="isActive">
              공개 상태 (활성화됨)
            </CheckboxLabel>
          </CheckboxGroup>
        </FormGroup>
      )}
      
      <ButtonGroup>
        <CancelButton type="button" onClick={handleCancel}>
          취소
        </CancelButton>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? '저장 중...' : initialData ? '수정 완료' : '등록하기'}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
};