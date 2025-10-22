<?php
$config = require __DIR__ . '/../config.php';

function normalize_origin_value($value)
{
    if (!$value) {
        return '';
    }
    $trimmed = rtrim($value, '/');
    if ($trimmed === '') {
        return '';
    }
    $parsed = parse_url($trimmed);
    if (!is_array($parsed) || empty($parsed['scheme']) || empty($parsed['host'])) {
        return '';
    }
    $scheme = strtolower($parsed['scheme']);
    $host = strtolower($parsed['host']);
    $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
    return sprintf('%s://%s%s', $scheme, $host, $port);
}

$originHeader = $_SERVER['HTTP_ORIGIN'] ?? '';
$normalizedOrigin = normalize_origin_value($originHeader);
$allowedOrigins = $config['allowed_origins'] ?? [];
$normalizedAllowed = array_values(array_filter(array_map('normalize_origin_value', $allowedOrigins)));
$allowAllOrigins = in_array('*', $allowedOrigins, true);

$matchesCandidate = static function ($origin, $candidate) {
    if (!$origin || !$candidate) {
        return false;
    }
    if ($origin === $candidate) {
        return true;
    }
    if (strlen($origin) < strlen($candidate)) {
        return false;
    }
    return substr($origin, -strlen($candidate)) === $candidate;
};

if ($allowAllOrigins) {
    header('Access-Control-Allow-Origin: *');
} elseif ($normalizedOrigin) {
    $originAllowed = in_array($normalizedOrigin, $normalizedAllowed, true);

    if (!$originAllowed) {
        foreach ($normalizedAllowed as $candidate) {
            if ($matchesCandidate($normalizedOrigin, $candidate)) {
                $originAllowed = true;
                break;
            }
        }
    }

    if ($originAllowed) {
        header('Access-Control-Allow-Origin: ' . $originHeader);
        header('Vary: Origin');
    } elseif ($originHeader) {
        header('Access-Control-Allow-Origin: ' . $originHeader);
        header('Vary: Origin');
        error_log(sprintf('StudySpace CORS cảnh báo: %s không có trong danh sách allowed_origins.', $originHeader));
    }
} elseif ($originHeader) {
    header('Access-Control-Allow-Origin: ' . $originHeader);
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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
