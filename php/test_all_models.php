<?php
$envPath = __DIR__ . '/../.env';
$apiKey = '';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        [$name, $value] = explode('=', $line, 2);
        if (trim($name) === 'BUG_TRACKER_GEMINI_API_KEY') {
            $apiKey = trim($value);
        }
    }
}

$modelsToTest = [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash'
];

foreach ($modelsToTest as $model) {
    echo "Testing $model...\n";
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . rawurlencode($apiKey);

    $payload = [
        'contents' => [
            [
                'parts' => [
                    ['text' => 'Hi']
                ]
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "HTTP Code: $httpCode\n";
    if ($httpCode == 200) {
        echo "SUCCESS!\n";
        break;
    } else {
        echo "Response: $response\n\n";
    }
}
