import Head from 'next/head';
import styles from '../styles/DownloadPage.module.css';

export default function DownloadPage() {
  return (
    <>
      <Head>
        <title>StudySpace Source Access</title>
        <meta
          name="description"
          content="Clone the StudySpace repository or create a fresh deployment package on demand."
        />
      </Head>
      <main className={styles.container}>
        <section className={styles.heroCard}>
          <h1>Lấy mã nguồn StudySpace</h1>
          <p>
            StudySpace không còn đóng gói sẵn file ZIP trong kho mã nguồn. Bạn có thể sao chép
            toàn bộ mã nguồn từ Git hoặc tự tạo gói ZIP mới để triển khai.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Tuỳ chỉnh Git</h2>
          <ol>
            <li>Sao chép repository lên GitHub/GitLab.</li>
            <li>
              Tạo kho trống trên tài khoản của bạn, sau đó chạy:
              <pre className={styles.codeBlock}>git clone https://github.com/&lt;tai-khoan&gt;/StudySpace.git</pre>
            </li>
            <li>Triển khai thư mục <code>vercel/</code> lên Vercel và <code>x10/</code> lên x10hosting.</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Tạo file ZIP khi cần</h2>
          <p>
            Nếu bạn muốn có một gói ZIP giống như <code>StudySpace_package.zip</code>, hãy tạo nó
            thẳng từ máy của bạn sau khi clone repository:
          </p>
          <pre className={styles.codeBlock}>
zip -r StudySpace_package.zip vercel x10 SETUP_INSTRUCTIONS.txt
          </pre>
          <p>
            Có thể thêm các tài nguyên khác vào lệnh ZIP nếu cần. Lệnh trên giúp
            bạn tạo file phù hợp để chia sẻ và triển khai thực tế.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Tài liệu đính kèm</h2>
          <ul>
            <li>
              <strong>SETUP_INSTRUCTIONS.txt</strong> – hướng dẫn triển khai chi tiết Vercel + x10.
            </li>
            <li>
              <strong>vercel/</strong> – giao diện Next.js, API streaming Gemini, tiện ích tìm ảnh/tạo ảnh.
            </li>
            <li>
              <strong>x10/</strong> – backend PHP với Turnstile, session cookie và schema MySQL.
            </li>
          </ul>
          <p>
            Hãy xem lại các file README kèm theo để đảm bảo nhập đúng các API key và
            thông tin cấu hình đã cấp.
          </p>
        </section>
      </main>
    </>
  );
}
