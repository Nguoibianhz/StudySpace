<?php
require __DIR__ . '/../lib/bootstrap.php';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = null;

if (preg_match('/Bearer\s+(.*)/', $authHeader, $matches)) {
    $token = trim($matches[1]);
}

if (!$token && isset($_COOKIE[$config['session_cookie']])) {
    $token = $_COOKIE[$config['session_cookie']];
}

if (!$token) {
    json_response(['message' => 'Chưa đăng nhập.'], 401);
}

try {
    $stmt = $pdo->prepare('SELECT s.id, s.expires_at, u.id AS user_id, u.username, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = :token');
    $stmt->execute(['token' => $token]);
    $session = $stmt->fetch();

    if (!$session) {
        json_response(['message' => 'Session không tồn tại.'], 404);
    }

    $expiresAt = new DateTimeImmutable($session['expires_at']);
    if ($expiresAt < new DateTimeImmutable()) {
        json_response(['message' => 'Session đã hết hạn.'], 401);
    }

    json_response([
        'user' => [
            'id' => $session['user_id'],
            'name' => $session['username'],
            'email' => $session['email'],
        ],
        'token' => $token,
        'expires_at' => $expiresAt->format(DateTimeInterface::ATOM),
    ]);
} catch (Throwable $e) {
    json_response(['message' => 'Không thể lấy session.'], 500);
}
