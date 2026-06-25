import { useCallback, useEffect, useRef, useState } from 'react';

export type FeedbackTone = 'error' | 'success';

type FeedbackModal = {
  readonly isOpen: boolean;
  readonly message: string;
  readonly tone: FeedbackTone;
  readonly show: (message: string, tone?: FeedbackTone) => void;
  readonly close: () => void;
};

const getFeedbackMessage = (message: string, tone: FeedbackTone) => {
  const trimmedMessage = message.trim();
  if (trimmedMessage) return trimmedMessage;
  return tone === 'success' ? '요청이 완료되었습니다.' : '요청 처리 중 오류가 발생했습니다.';
};

export const useFeedbackModal = (): FeedbackModal => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState<FeedbackTone>('error');
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearTimer();
    setIsOpen(false);
    setMessage('');
  }, [clearTimer]);

  const show = useCallback(
    (nextMessage: string, nextTone: FeedbackTone = 'error') => {
      clearTimer();
      setMessage(getFeedbackMessage(nextMessage, nextTone));
      setTone(nextTone);
      setIsOpen(true);
      timerRef.current = window.setTimeout(() => {
        setIsOpen(false);
        setMessage('');
        timerRef.current = null;
      }, 2000);
    },
    [clearTimer]
  );

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return { isOpen, message, tone, show, close };
};
