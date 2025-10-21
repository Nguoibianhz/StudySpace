export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm.' });
  }

  const apiKey = process.env.PIXABAY_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Chưa cấu hình PIXABAY_KEY cho tiện ích tìm ảnh.' });
  }

  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', query);
  url.searchParams.set('image_type', 'photo');
  url.searchParams.set('per_page', '12');
  url.searchParams.set('safesearch', 'true');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Pixabay trả về lỗi.');
    }
    const data = await response.json();
    res.status(200).json({ hits: data.hits || [] });
  } catch (error) {
    res.status(502).json({ message: error.message || 'Không thể truy cập Pixabay.' });
  }
}
