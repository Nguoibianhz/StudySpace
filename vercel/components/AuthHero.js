import styles from '../styles/AuthHero.module.css';

export default function AuthHero() {
  return (
    <div className={styles.heroCard}>
      <div className={styles.logo}>StudySpace</div>
      <h1>Không gian học tập chill với AI Gemini</h1>
      <p>
        StudySpace kết hợp AI Gemini, tiện ích tìm kiếm và tạo ảnh để bạn học tập, sáng tạo và
        giải trí trong cùng một dashboard. Đăng nhập để đồng bộ lịch sử, ghi nhớ tối đa 7 tin nhắn
        gần nhất và nhận trải nghiệm streaming mượt mà.
      </p>
      <ul>
        <li>Cloudflare Turnstile bảo vệ đăng nhập thủ công</li>
        <li>Đăng nhập nhanh với Google, Facebook, GitHub</li>
        <li>100 lượt hỏi miễn phí mỗi ngày · giới hạn 20k tokens/lần</li>
      </ul>
      <div className={styles.badges}>
        <span className="badge">Dark Ocean Theme</span>
        <span className="badge">Powered by Gemini 2.x Flash</span>
      </div>
    </div>
  );
}
