import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

import {
  Notice,
  CreateNoticeRequest,
  UpdateNoticeRequest,
  NoticeService,
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

  img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    margin: 0.8em 0;
  }
`;

const UploadStateText = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.78rem;
`;

const UploadErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.78rem;
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
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
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

  const insertAtCursor = (insertText: string) => {
    const target = contentRef.current;
    if (!target) {
      setContent(prev => `${prev}${prev.endsWith('\n') ? '' : '\n'}${insertText}`);
      return;
    }

    const start = target.selectionStart;
    const end = target.selectionEnd;
    const current = content;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
    const needsTrailingNewline = after.length > 0 && !after.startsWith('\n');
    const inserted = `${needsLeadingNewline ? '\n' : ''}${insertText}${
      needsTrailingNewline ? '\n' : ''
    }`;
    const nextValue = `${before}${inserted}${after}`;

    setContent(nextValue);

    requestAnimationFrame(() => {
      const nextCursor = before.length + inserted.length;
      target.focus();
      target.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handlePasteImage = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find(item => {
      return item.kind === 'file' && item.type.startsWith('image/');
    });

    if (!imageItem) {
      return;
    }

    const file = imageItem.getAsFile();
    if (!file) {
      return;
    }

    event.preventDefault();
    setImageUploadError('');
    setIsImageUploading(true);

    try {
      const imageUrl = await NoticeService.uploadNoticeImage(file);
      insertAtCursor(`![공지 이미지](${imageUrl})`);
    } catch (uploadError) {
      console.error('Failed to upload pasted notice image:', uploadError);
      setImageUploadError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsImageUploading(false);
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
          ref={contentRef}
          value={content}
          onChange={event => setContent(event.target.value)}
          onPaste={handlePasteImage}
          placeholder='내용을 입력하세요'
          required
        />
        <GuideText>
          마크다운을 지원합니다. 줄바꿈 태그({`<br />`}), 이미지({`![설명](이미지URL)`}), 표,
          코드블록을 사용할 수 있습니다.
        </GuideText>
        <GuideText>이미지를 붙여넣기하면 자동 업로드되어 본문에 링크가 삽입됩니다.</GuideText>
        {isImageUploading && <UploadStateText>이미지를 업로드하고 있습니다...</UploadStateText>}
        {imageUploadError && <UploadErrorText>{imageUploadError}</UploadErrorText>}
      </FormGroup>

      <FormGroup>
        <PreviewCard>
          <PreviewTitle>미리보기</PreviewTitle>
          {content.trim() ? (
            <MarkdownPreview>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                allowedElements={[
                  'h1',
                  'h2',
                  'h3',
                  'h4',
                  'h5',
                  'h6',
                  'p',
                  'strong',
                  'em',
                  'del',
                  'blockquote',
                  'ul',
                  'ol',
                  'li',
                  'code',
                  'pre',
                  'hr',
                  'br',
                  'a',
                  'img',
                  'table',
                  'thead',
                  'tbody',
                  'tr',
                  'th',
                  'td',
                ]}
                unwrapDisallowed
              >
                {content}
              </ReactMarkdown>
            </MarkdownPreview>
          ) : (
            <PreviewEmpty>내용을 입력하면 미리보기가 표시됩니다.</PreviewEmpty>
          )}
        </PreviewCard>
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
