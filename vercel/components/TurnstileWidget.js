import { useEffect, useRef, useState } from 'react';

export default function TurnstileWidget({ siteKey, onVerify, onError, refreshKey = 0 }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const verifyCallbackRef = useRef(onVerify);
  const errorCallbackRef = useRef(onError);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    verifyCallbackRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    errorCallbackRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const markReady = () => {
      if (!cancelled) {
        setIsReady(true);
      }
    };

    const markErrored = () => {
      if (!cancelled) {
        setIsReady(false);
        verifyCallbackRef.current?.('');
        errorCallbackRef.current?.(
          'Không thể tải Cloudflare Turnstile. Kiểm tra lại cấu hình Cloudflare hoặc thử lại sau.',
        );
      }
    };

    if (window.turnstile) {
      setIsReady(true);
    } else {
      const poll = () => {
        if (cancelled) {
          return;
        }
        if (window.turnstile) {
          setIsReady(true);
        } else {
          setTimeout(poll, 200);
        }
      };
      poll();
    }

    window.addEventListener('studyspace-turnstile-ready', markReady);
    window.addEventListener('studyspace-turnstile-error', markErrored);

    return () => {
      cancelled = true;
      window.removeEventListener('studyspace-turnstile-ready', markReady);
      window.removeEventListener('studyspace-turnstile-error', markErrored);
    };
  }, []);

  useEffect(() => {
    if (!siteKey || !isReady || typeof window === 'undefined') {
      return undefined;
    }

    if (!containerRef.current || !window.turnstile?.render) {
      return undefined;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    verifyCallbackRef.current?.('');

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => verifyCallbackRef.current?.(token ?? ''),
      'expired-callback': () => verifyCallbackRef.current?.(''),
      'error-callback': () => {
        verifyCallbackRef.current?.('');
        errorCallbackRef.current?.(
          'Cloudflare Turnstile gặp lỗi trong lúc xác thực. Vui lòng tải lại thử thách.',
        );
      },
      theme: 'dark',
      appearance: 'interaction-only',
    });

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      verifyCallbackRef.current?.('');
    };
  }, [siteKey, isReady, refreshKey]);

  return <div ref={containerRef} data-turnstile-container style={{ minHeight: 70 }} />;
}
