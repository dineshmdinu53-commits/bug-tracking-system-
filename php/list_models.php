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

$url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' . rawurlencode($apiKey);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
if (isset($data['models'])) {
    foreach ($data['models'] as $m) {
        if (strpos($m['name'], 'gemini-1.5') !== false || strpos($m['name'], 'gemini-2') !== false) {
            echo $m['name'] . "\n";
        }
    }
} else {
    echo $response;
}
