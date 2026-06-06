<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'GET method required']);
    exit();
}

$roleFilter = $_GET['role'] ?? '';

if ($roleFilter) {
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE role = :role ORDER BY name ASC");
    $stmt->execute([':role' => $roleFilter]);
} else {
    $stmt = $pdo->query("SELECT id, name, email, role FROM users ORDER BY name ASC");
}

echo json_encode($stmt->fetchAll());
?>
