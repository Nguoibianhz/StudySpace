<?php
$config = require __DIR__ . '/../config.php';

$dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $config['db']['host'], $config['db']['name'], $config['db']['charset']);
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $config['db']['user'], $config['db']['pass'], $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Không thể kết nối cơ sở dữ liệu.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

function json_response($payload, $status = 200)
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function verify_turnstile($token, $secret)
{
    if (!$token) {
        return false;
    }
    $data = http_build_query([
        'secret' => $secret,
        'response' => $token,
    ]);

    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => $data,
            'timeout' => 5,
        ],
    ];
    $context  = stream_context_create($options);
    $result = file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, $context);
    if ($result === false) {
        return false;
    }
    $decoded = json_decode($result, true);
    return $decoded['success'] ?? false;
}

function hash_password($password)
{
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verify_password($password, $hash)
{
    return password_verify($password, $hash);
}

function create_session_token()
{
    return bin2hex(random_bytes(32));
}
