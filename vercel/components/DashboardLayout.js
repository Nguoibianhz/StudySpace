import Link from 'next/link';
import styles from '../styles/DashboardLayout.module.css';

export default function DashboardLayout({ user, children, onSignOut }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>StudySpace</div>
        <nav className={styles.nav}>
          <Link href="/dashboard">Dashboard</Link>
          <a href="https://ai.google.dev/gemini-api" target="_blank" rel="noreferrer">
            Gemini Docs
          </a>
        </nav>
        <div className={styles.profile}>
          <div className={styles.userInfo}>
            <span className={styles.name}>{user?.name || 'Học viên'}</span>
            <span className={styles.email}>{user?.email}</span>
          </div>
          <button className="button-secondary" onClick={onSignOut}>
            Đăng xuất
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
