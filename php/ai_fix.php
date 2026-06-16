<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$codeSnippet = trim($_POST['code_snippet'] ?? '');
if ($codeSnippet === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Code snippet is required']);
    exit();
}

if (GEMINI_API_KEY === '') {
    http_response_code(503);
    echo json_encode([
        'status' => 'error',
        'message' => 'AI fix is disabled until BUG_TRACKER_GEMINI_API_KEY is configured on the server.'
    ]);
    exit();
}

$prompt = "You are an expert programmer. Analyze the following code snippet, identify bugs or issues. Return your response ONLY as a JSON object with two keys: 'fixed_code' containing the corrected code as a string, and 'error_descriptions' containing an array of strings where each string briefly describes a specific bug you found and fixed. Do not return any markdown wrapping like ```json.\n\nCode to fix:\n" . $codeSnippet;

$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' . rawurlencode(GEMINI_API_KEY);

$payload = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.2,
        'maxOutputTokens' => 1024,
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
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $curlError) {
    http_response_code(502);
    echo json_encode(['status' => 'error', 'message' => 'Unable to contact the AI service right now.']);
    exit();
}

if ($httpCode !== 200) {
    http_response_code(502);
    $errorData = json_decode($response, true);
    $errMsg = $errorData['error']['message'] ?? 'AI service returned an unexpected response.';
    
    if ($httpCode === 429) {
        $errMsg = 'Google API Quota Exceeded (Free Tier Limit Reached). Please check your billing/quota settings at Google AI Studio.';
    }
    
    echo json_encode(['status' => 'error', 'message' => $errMsg]);
    exit();
}

$result = json_decode($response, true);
$aiText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

if ($aiText === '') {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Unexpected AI response format']);
    exit();
}

$aiText = preg_replace('/^```json\s*/i', '', trim($aiText));
$aiText = preg_replace('/^```\s*/i', '', $aiText);
$aiText = preg_replace('/```$/', '', $aiText);
$aiText = trim($aiText);

$aiData = json_decode($aiText, true);

if (!is_array($aiData) || !isset($aiData['fixed_code'])) {
    $fixedCode = $aiText;
    $errorDescriptions = ['Applied general AI corrections and formatting.'];
} else {
    $fixedCode = $aiData['fixed_code'];
    $errorDescriptions = $aiData['error_descriptions'] ?? ['Applied AI corrections.'];
}

echo json_encode([
    'status' => 'success',
    'fixed_code' => trim($fixedCode),
    'error_descriptions' => $errorDescriptions,
]);
?>
