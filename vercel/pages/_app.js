import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import Script from 'next/script';
import '../styles/globals.css';

export default function StudySpaceApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>StudySpace · Focused AI Workspace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="StudySpace · Nơi học tập chill với AI Gemini, tiện ích tìm kiếm và tạo ảnh."
        />
      </Head>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            const eventName = 'studyspace-turnstile-ready';
            const event =
              typeof window.CustomEvent === 'function'
                ? new window.CustomEvent(eventName)
                : new Event(eventName);
            window.dispatchEvent(event);
          }
        }}
        onError={() => {
          if (typeof window !== 'undefined') {
            const eventName = 'studyspace-turnstile-error';
            const event =
              typeof window.CustomEvent === 'function'
                ? new window.CustomEvent(eventName)
                : new Event(eventName);
            window.dispatchEvent(event);
          }
        }}
      />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
