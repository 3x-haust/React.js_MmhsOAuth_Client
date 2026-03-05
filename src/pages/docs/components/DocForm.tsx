import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

import {
  CreateDeveloperDocRequest,
  DeveloperDoc,
  UpdateDeveloperDocRequest,
} from '@/features/developer-doc';

type DocFormProps = {
  initialData?: DeveloperDoc;
  onSubmit: (data: CreateDeveloperDocRequest | UpdateDeveloperDocRequest) => Promise<void>;
  isLoading: boolean;
};

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

const GuideText = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.78rem;
  line-height: 1.5;
`;

const PreviewCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px;
`;

const PreviewTitle = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const PreviewEmpty = styled.p`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.secondaryText};
  font-size: 0.84rem;
`;

const MarkdownPreview = styled.div`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  line-height: 1.72;
  overflow-wrap: anywhere;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.3em;
    margin-bottom: 0.45em;
    line-height: 1.3;
    font-weight: 700;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.24rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  p {
    margin: 0.72em 0;
  }

  ul,
  ol {
    margin: 0.72em 0;
    padding-left: 1.3em;
  }

  li + li {
    margin-top: 0.24em;
  }

  blockquote {
    margin: 0.9em 0;
    padding: 0.62em 0.9em;
    border-left: 3px solid ${({ theme }) => theme.colors.primaryDark};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.secondaryText};
    border-radius: 8px;
  }

  hr {
    margin: 1.1em 0;
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }

  code {
    font-family: 'SFMono-Regular', 'Menlo', 'Consolas', monospace;
    font-size: 0.84em;
    padding: 0.08em 0.35em;
    border-radius: 6px;
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  pre {
    margin: 0.95em 0;
    padding: 0.8em 0.9em;
    border-radius: 10px;
    overflow: auto;
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }

  pre code {
    padding: 0;
    border: none;
    background: transparent;
    font-size: 0.83rem;
    line-height: 1.6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.95em 0;
    font-size: 0.84rem;
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.48em 0.56em;
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    font-weight: 700;
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

export const DocForm: React.FC<DocFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setIsPublished(initialData.isPublished);
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const formData: CreateDeveloperDocRequest | UpdateDeveloperDocRequest = {
      title,
      content,
    };

    if (initialData) {
      (formData as UpdateDeveloperDocRequest).isPublished = isPublished;
    }

    try {
      await onSubmit(formData);
    } catch (submitError) {
      console.error('Developer doc form submit error:', submitError);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?')) {
      navigate('/docs');
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
          placeholder='문서 제목을 입력하세요'
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor='content'>내용</Label>
        <GuideText>
          마크다운 문법을 지원합니다. 예: <code># 제목</code>, <code>```ts</code>, 표, 체크리스트
        </GuideText>
        <Textarea
          id='content'
          value={content}
          onChange={event => setContent(event.target.value)}
          placeholder='마크다운으로 문서 내용을 입력하세요'
          required
        />
        <PreviewCard>
          <PreviewTitle>미리보기</PreviewTitle>
          {content.trim() ? (
            <MarkdownPreview>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </MarkdownPreview>
          ) : (
            <PreviewEmpty>내용을 입력하면 마크다운 결과가 여기에 표시됩니다.</PreviewEmpty>
          )}
        </PreviewCard>
      </FormGroup>

      {initialData && (
        <FormGroup>
          <CheckboxGroup htmlFor='isPublished'>
            <Checkbox
              id='isPublished'
              type='checkbox'
              checked={isPublished}
              onChange={event => setIsPublished(event.target.checked)}
            />
            문서 공개 상태
          </CheckboxGroup>
        </FormGroup>
      )}

      <ButtonGroup>
        <CancelButton type='button' onClick={handleCancel}>
          취소
        </CancelButton>
        <SubmitButton type='submit' disabled={isLoading}>
          {isLoading ? '저장 중...' : initialData ? '수정 완료' : '문서 등록'}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
};
