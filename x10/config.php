<?php
// Cấu hình cơ bản cho máy chủ x10hosting
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'x10_db_name',
        'user' => 'x10_user',
        'pass' => 'x10_password',
        'charset' => 'utf8mb4'
    ],
    'turnstile_secret' => '0x4AAAAAAB73ye6AEry1nmscbI8FjBdMD5Y',
    'session_cookie' => 'studyspace_session',
    'session_lifetime_days' => 30
];
