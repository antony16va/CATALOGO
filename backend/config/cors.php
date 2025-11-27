<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Permite cualquier origen en desarrollo
    'allowed_origins_patterns' => [
        // Localhost con cualquier puerto
        '/^http:\/\/localhost(:\d+)?$/',
        // IP local de red con cualquier puerto
        '/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/',
        // 127.0.0.1 con cualquier puerto
        '/^http:\/\/127\.0\.0\.1(:\d+)?$/',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
