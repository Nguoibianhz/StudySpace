# StudySpace · PHP API (x10hosting)

Các endpoint PHP hỗ trợ đăng ký/đăng nhập thủ công, lưu session cookie và cung cấp schema MySQL.

## Cấu trúc

```
api/
  register.php
  login.php
  logout.php
  session.php
lib/
  bootstrap.php
config.php
schema.sql
```

## Hướng dẫn triển khai

1. Tạo database MySQL trên x10hosting, nhập file `schema.sql`.
2. Cập nhật thông tin kết nối trong `config.php`.
3. Upload toàn bộ thư mục `api/` và `lib/` lên hosting (ví dụ `public_html/api`).
4. Đảm bảo hosting hỗ trợ HTTPS để Cloudflare Turnstile hoạt động.

## Endpoint

- `POST /api/register.php`
  - Body JSON: `{ username, email, password, birthday, turnstileToken }`
  - Trả về 200 khi đăng ký thành công.
- `POST /api/login.php`
  - Body JSON: `{ email, password, remember }`
  - Nếu `remember=true` sẽ set cookie `studyspace_session`.
  - Trả về thông tin user + token.
- `POST /api/logout.php`
  - Body JSON: `{ token }` (tuỳ chọn, mặc định lấy từ cookie).
- `GET /api/session.php`
  - Header `Authorization: Bearer <token>` hoặc cookie.

Tất cả response sử dụng JSON UTF-8.
