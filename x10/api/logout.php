<?php
require __DIR__ . '/../lib/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['message' => 'Method Not Allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? ($_COOKIE[$config['session_cookie']] ?? null);

if (!$token) {
    json_response(['message' => 'Không có token đăng nhập.'], 400);
}

try {
    $stmt = $pdo->prepare('DELETE FROM sessions WHERE token = :token');
    $stmt->execute(['token' => $token]);
    $cookieOptions = [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None',
    ];

    if (!empty($config['cookie_domain'])) {
        $cookieOptions['domain'] = $config['cookie_domain'];
    }

    setcookie($config['session_cookie'], '', $cookieOptions);
    json_response(['message' => 'Đã đăng xuất.']);
} catch (Throwable $e) {
    json_response(['message' => 'Không thể đăng xuất.'], 500);
}
