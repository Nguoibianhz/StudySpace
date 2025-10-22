<?php
require __DIR__ . '/../lib/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['message' => 'Method Not Allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$birthday = $input['birthday'] ?? '';
$turnstileToken = $input['turnstileToken'] ?? '';

if (!$username || !$email || !$password || !$birthday) {
    json_response(['message' => 'Thiếu thông tin bắt buộc.'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['message' => 'Email không hợp lệ.'], 422);
}

if (strlen($password) < 8) {
    json_response(['message' => 'Mật khẩu tối thiểu 8 ký tự.'], 422);
}

if (!verify_turnstile($turnstileToken, $config['turnstile_secret'])) {
    json_response(['message' => 'Không vượt qua xác thực Cloudflare Turnstile.'], 403);
}

try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        json_response(['message' => 'Email đã tồn tại.'], 409);
    }

    $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, birthday, created_at) VALUES (:username, :email, :password_hash, :birthday, NOW())');
    $stmt->execute([
        'username' => $username,
        'email' => $email,
        'password_hash' => hash_password($password),
        'birthday' => $birthday,
    ]);

    json_response(['message' => 'Đăng ký thành công.']);
} catch (Throwable $e) {
    json_response(['message' => 'Lỗi máy chủ nội bộ.'], 500);
}
