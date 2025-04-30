import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import slugify from 'slugify';
import styled from 'styled-components';

const DocsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
`;

const MarkdownStyles = styled.div`
  h1 {
    font-size: 2.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
    padding-bottom: 0.5rem;
    margin-top: 2.5rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
  }

  h3 {
    font-size: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  ul,
  ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  blockquote {
    border-left: 4px solid ${({ theme }) => theme.colors?.primary || '#5E81F4'};
    margin-left: 0;
    padding-left: 1rem;
    color: ${({ theme }) => theme.colors?.secondaryText || '#666'};
    margin-bottom: 1.5rem;
  }

  code:not(pre code) {
    background-color: ${({ theme }) => theme.colors?.codeBg || '#f6f8fa'};
    color: ${({ theme }) => theme.colors?.codeText || '#333'};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 90%;
  }

  a {
    color: ${({ theme }) => theme.colors?.primary || '#5E81F4'};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  pre {
    margin-bottom: 2rem;
    border-radius: 8px;
  }

  hr {
    margin: 3rem 0;
    border: 0;
    border-top: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  }
`;

const createHeadingId = text => {
  return slugify(String(text), {
    lower: true,
    locale: 'ko',
    remove: /[*+~.()'"!:@]/g,
  });
};

export const DocsPage = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef(null);

  const components = {
    code({
      inline,
      className,
      children,
      ...props
    }: {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter language={match[1]} style={atomDark} showLineNumbers {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
      const id = createHeadingId(String(children));
      return (
        <h1 id={id} {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
      const id = createHeadingId(String(children));
      return (
        <h2 id={id} {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
      const id = createHeadingId(String(children));
      return (
        <h3 id={id} {...props}>
          {children}
        </h3>
      );
    },
    a: ({
      href,
      children,
      ...props
    }: {
      href?: string;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      if (href?.startsWith('http')) {
        return (
          <a href={href} target='_blank' rel='noopener noreferrer' {...props}>
            {children}
          </a>
        );
      } else if (href?.startsWith('#')) {
        return (
          <a
            href={href}
            onClick={e => {
              e.preventDefault();
              const targetId = href.slice(1);

              let element = document.getElementById(targetId);

              if (!element) {
                const slugifiedId = createHeadingId(targetId);
                element = document.getElementById(slugifiedId);
              }

              if (!element && typeof children === 'string') {
                const childId = createHeadingId(String(children));
                element = document.getElementById(childId);
              }

              if (element) {
                setTimeout(() => {
                  const yOffset = -80;
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

                  window.scrollTo({
                    top: y,
                    behavior: 'smooth',
                  });
                }, 100);
              }
            }}
            {...props}
          >
            {children}
          </a>
        );
      }

      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  };

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch('/docs/docs.md');
        const text = await response.text();
        setMarkdownContent(text);
      } catch (error) {
        console.error('Failed to fetch markdown:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkdown();
  }, []);

  useEffect(() => {
    if (!isLoading && window.location.hash) {
      const hash = window.location.hash.substring(1);

      let element = document.getElementById(hash);

      if (!element) {
        const slugifiedId = createHeadingId(hash);
        element = document.getElementById(slugifiedId);
      }

      if (element) {
        setTimeout(() => {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({
            top: y,
            behavior: 'smooth',
          });
        }, 300);
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return <DocsContainer>문서를 불러오는 중...</DocsContainer>;
  }

  return (
    <DocsContainer>
      <MarkdownStyles ref={contentRef}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {markdownContent}
        </ReactMarkdown>
      </MarkdownStyles>
    </DocsContainer>
  );
};
