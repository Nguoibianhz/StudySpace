import { getSession, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../components/DashboardLayout';
import StudySpaceChat from '../components/StudySpaceChat';
import UtilityPanel from '../components/UtilityPanel';
import styles from '../styles/DashboardPage.module.css';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className={styles.loading}>Đang tải thông tin tài khoản...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout
      user={session.user}
      onSignOut={() => signOut({ callbackUrl: '/' })}
    >
      <div className={styles.grid}>
        <StudySpaceChat user={session.user} />
        <UtilityPanel />
      </div>
    </DashboardLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return { props: { session } };
}
