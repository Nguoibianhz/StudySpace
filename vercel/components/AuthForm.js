import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import TurnstileWidget from './TurnstileWidget';
import styles from '../styles/AuthForm.module.css';

const TURNSTILE_SITE_KEY = '0x4AAAAAAB73yemVVzQT9Kr7';

const DEFAULT_FORM = {
  username: '',
  email: '',
  password: '',
  birthday: '',
};

export default function AuthForm({ mode = 'login' }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const turnstileToken = useRef('');

  useEffect(() => {
    setForm(DEFAULT_FORM);
    setError('');
    setSuccess('');
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PHP_BASE_URL}/register.php`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...form,
              turnstileToken: turnstileToken.current,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Đăng ký thất bại.');
        }
        setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      } else {
        const result = await signIn('credentials', {
          redirect: false,
          email: form.email,
          password: form.password,
          turnstileToken: turnstileToken.current,
          remember: rememberMe ? 'true' : 'false',
        });
        if (result?.error) {
          throw new Error(result.error);
        }
        setSuccess('Đăng nhập thành công, đang chuyển hướng...');
      }
      setForm(DEFAULT_FORM);
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err) {
      setError(err.message || 'Không thể đăng nhập bằng mạng xã hội.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <h2>{mode === 'login' ? 'Đăng nhập StudySpace' : 'Tạo tài khoản mới'}</h2>
        <p>
          {mode === 'login'
            ? 'Sử dụng email và mật khẩu hoặc đăng nhập bằng Google / Facebook / GitHub.'
            : 'Điền đầy đủ thông tin để trải nghiệm toàn bộ tính năng của StudySpace.'}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className={styles.fieldGroup}>
            <label htmlFor="username">Tên hiển thị</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Ví dụ: HieuDz"
              required
              className="input"
            />
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@study.space"
            required
            className="input"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="input"
            placeholder="Tối thiểu 8 ký tự"
          />
        </div>

        {mode === 'register' && (
          <div className={styles.fieldGroup}>
            <label htmlFor="birthday">Ngày sinh</label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              value={form.birthday}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        )}

        <div className={styles.turnstileBox}>
          <TurnstileWidget
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={(token) => {
              turnstileToken.current = token;
            }}
          />
        </div>

        {mode === 'login' && (
          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Ghi nhớ đăng nhập
          </label>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>

      <div className={styles.divider}>hoặc</div>

      <div className={styles.oauthGrid}>
        <button
          type="button"
          className={styles.oauthButton}
          onClick={() => handleOAuth('google')}
        >
          Đăng nhập với Google
        </button>
        <button
          type="button"
          className={styles.oauthButton}
          onClick={() => handleOAuth('facebook')}
        >
          Đăng nhập với Facebook
        </button>
        <button
          type="button"
          className={styles.oauthButton}
          onClick={() => handleOAuth('github')}
        >
          Đăng nhập với GitHub
        </button>
      </div>
    </div>
  );
}
