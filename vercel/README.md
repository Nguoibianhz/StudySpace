# StudySpace · Vercel App

Ứng dụng Next.js triển khai trên Vercel, kết nối với backend PHP (x10hosting) cho đăng nhập thủ công và sử dụng Google Gemini để
stream trả lời.

## Chức năng chính

- Đăng nhập/đăng ký thủ công với Cloudflare Turnstile, lưu session với tùy chọn "Ghi nhớ đăng nhập".
- Đăng nhập nhanh bằng Google, Facebook, GitHub thông qua NextAuth.
- Dashboard StudySpace AI với nhiều chế độ (Auto, Fast, Toán, Văn, Tiếng Anh, Searching, Coding).
- Streaming real-time Gemini 2.5 Flash (text) và 2.0 Flash (ảnh + text), lưu lịch sử trò chuyện localStorage.
- Giới hạn 100 lượt hỏi miễn phí mỗi ngày / 20k tokens mỗi lượt trên backend Node.
- Tiện ích tìm ảnh (Pixabay API) và tạo ảnh Pollinations.

## Lấy mã nguồn

- Clone repository Git của bạn để lấy toàn bộ thư mục `vercel/` và `x10/`.
- Trang `/download` trên môi trường Vercel cung cấp hướng dẫn chi tiết về cách sao chép repository và
  tự tạo gói ZIP khi cần.

## Cấu hình môi trường

Sao chép `.env.example` thành `.env.local` rồi điền:

- `NEXTAUTH_URL` + `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_PHP_BASE_URL`: URL thư mục chứa các endpoint PHP trên x10hosting (không có dấu `/` ở cuối).
  - Nếu deploy dưới HTTPS, hãy dùng hẳn `https://...` (hoặc cấu hình backend tự cấp HTTPS) để tránh lỗi mixed content/CORS.
- Client ID/secret cho Google, Facebook, GitHub.
- `PIXABAY_KEY`: API key miễn phí từ https://pixabay.com/api/docs/

## Chạy cục bộ

```bash
npm install
npm run dev
```

Ứng dụng chạy ở http://localhost:3000.

Khi deploy Vercel, cấu hình biến môi trường tương tự (`NEXTAUTH_SECRET`, `NEXT_PUBLIC_PHP_BASE_URL`, OAuth, `PIXABAY_KEY`).
