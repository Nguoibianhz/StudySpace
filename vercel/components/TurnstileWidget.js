import { useEffect } from 'react';

export default function TurnstileWidget({ siteKey, onVerify }) {
  useEffect(() => {
    if (!siteKey) return;

    const renderTurnstile = () => {
      if (typeof window === 'undefined') return;
      if (!window.turnstile) {
        setTimeout(renderTurnstile, 200);
        return;
      }
      window.turnstile.render('#cf-turnstile', {
        sitekey: siteKey,
        callback: (token) => onVerify?.(token),
        'response-field': true,
        theme: 'dark',
        appearance: 'interaction-only',
      });
    };

    renderTurnstile();
  }, [siteKey, onVerify]);

  return <div id="cf-turnstile" style={{ minHeight: 70 }}></div>;
}
