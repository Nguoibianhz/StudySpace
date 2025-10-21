import { useState } from 'react';
import styles from '../styles/UtilityPanel.module.css';

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000);
}

export default function UtilityPanel() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    try {
      const response = await fetch(`/api/tools/image-search?q=${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || 'Không thể tìm ảnh.');
      }
      const data = await response.json();
      setResults(data.hits || []);
    } catch (err) {
      setError(err.message || 'Lỗi tìm kiếm ảnh');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateImage = () => {
    if (!imagePrompt.trim()) return;
    const seed = randomSeed();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      imagePrompt.trim()
    )}?width=1024&height=1024&enhance=true&seed=${seed}&nologo=true`;
    setGeneratedUrl(url);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div>
          <h3>Tiện ích tìm kiếm ảnh</h3>
          <p>Nhập từ khóa, StudySpace sẽ trả về ảnh từ thư viện Pixabay (không dùng AI).</p>
        </div>
        <div className={styles.searchBar}>
          <input
            className="input"
            placeholder="Ví dụ: nebula, study desk, galaxy"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="button-primary" onClick={handleSearch} disabled={searching}>
            {searching ? 'Đang tìm...' : 'Tìm ảnh'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.imageGrid}>
          {results.map((item) => (
            <a
              key={item.id}
              href={item.pageURL}
              target="_blank"
              rel="noreferrer"
              className={styles.imageCard}
            >
              <img src={item.previewURL} alt={item.tags} />
              <span>{item.tags}</span>
            </a>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div>
          <h3>Tạo ảnh tức thì</h3>
          <p>Dùng endpoint Pollinations để tạo ảnh nhanh, mỗi lần sinh seed ngẫu nhiên.</p>
        </div>
        <div className={styles.searchBar}>
          <input
            className="input"
            placeholder="Miêu tả ảnh bạn muốn tạo"
            value={imagePrompt}
            onChange={(event) => setImagePrompt(event.target.value)}
          />
          <button className="button-secondary" onClick={handleCreateImage}>
            Tạo ảnh
          </button>
        </div>
        {generatedUrl && (
          <div className={styles.generatedPreview}>
            <img src={generatedUrl} alt={imagePrompt} />
            <a href={generatedUrl} target="_blank" rel="noreferrer">
              Mở ảnh gốc
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
