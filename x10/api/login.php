<?php
require __DIR__ . '/../lib/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['message' => 'Method Not Allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$remember = (bool)($input['remember'] ?? false);

if (!$email || !$password) {
    json_response(['message' => 'Thiếu thông tin đăng nhập.'], 422);
}

try {
    $stmt = $pdo->prepare('SELECT id, username, email, password_hash FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !verify_password($password, $user['password_hash'])) {
        json_response(['message' => 'Email hoặc mật khẩu không đúng.'], 401);
    }

    $token = create_session_token();
    $expireAt = new DateTimeImmutable(sprintf('+%d days', $config['session_lifetime_days']));

    $pdo->prepare('INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES (:user_id, :token, :expires_at, NOW())')
        ->execute([
            'user_id' => $user['id'],
            'token' => $token,
            'expires_at' => $expireAt->format('Y-m-d H:i:s'),
        ]);

    if ($remember) {
        setcookie($config['session_cookie'], $token, [
            'expires' => $expireAt->getTimestamp(),
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    json_response([
        'message' => 'Đăng nhập thành công.',
        'user' => [
            'id' => $user['id'],
            'name' => $user['username'],
            'email' => $user['email'],
        ],
        'token' => $token,
        'expires_at' => $expireAt->format(DateTimeInterface::ATOM),
    ]);
} catch (Throwable $e) {
    json_response(['message' => 'Không thể đăng nhập.'], 500);
}
