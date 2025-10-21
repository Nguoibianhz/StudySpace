import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
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
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
