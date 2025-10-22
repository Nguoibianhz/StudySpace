import { useState } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';
import AuthHero from '../components/AuthHero';
import AuthForm from '../components/AuthForm';
import styles from '../styles/IndexPage.module.css';

export default function Home() {
  const [mode, setMode] = useState('login');
  const router = useRouter();

  const toggleMode = (nextMode) => {
    setMode(nextMode);
  };

  return (
    <AuthLayout
      hero={<AuthHero />}
    >
      <div className={styles.switcher}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
            onClick={() => toggleMode('login')}
          >
            Đăng nhập
          </button>
          <button
            className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
            onClick={() => toggleMode('register')}
          >
            Đăng ký
          </button>
        </div>
        <AuthForm mode={mode} />
        <button className={styles.dashboardShortcut} onClick={() => router.push('/dashboard')}>
          Xem nhanh dashboard
        </button>
      </div>
    </AuthLayout>
  );
}

Home.getInitialProps = async (context) => {
  const session = await getSession(context);
  if (context.res && session) {
    context.res.writeHead(302, { Location: '/dashboard' });
    context.res.end();
  }
  return {};
};
