<?php
// Cấu hình cơ bản cho máy chủ x10hosting
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'btltwovx_hieudz',
        'user' => 'btltwovx_hieudz',
        'pass' => 'LdF66xA4V2xrWUnYSb5s',
        'charset' => 'utf8mb4'
    ],
    'turnstile_secret' => '0x4AAAAAAB73ye6AEry1nmscbI8FjBdMD5Y',
    'session_cookie' => 'studyspace_session',
    'session_lifetime_days' => 30,
    'cookie_domain' => null,
    'allowed_origins' => [
        'https://study.nguyenmanhhieu.info.vn',
        'http://localhost:3000'
    ]
];
