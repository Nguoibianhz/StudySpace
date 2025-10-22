import styles from '../styles/AuthLayout.module.css';

export default function AuthLayout({ children, hero }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>{hero}</div>
      <div className={styles.form}>{children}</div>
    </div>
  );
}
