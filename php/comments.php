<?php
header('Content-Type: application/json');
require_once 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'POST method required']);
    exit();
}

$role = $_SESSION['role'] ?? '';
if (!in_array($role, ['Developer', 'Admin'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access Denied. Only Developers can add comments.']);
    exit();
}

$bug_id = $_POST['bug_id'] ?? '';
$author_name = $_SESSION['name'] ?? ($_POST['author_name'] ?? 'Unknown');
$text = $_POST['text'] ?? '';

if (!$bug_id || !$text) {
    http_response_code(400);
    echo json_encode(['message' => 'Bug ID and comment text are required']);
    exit();
}

if (!$author_name) {
    $author_name = 'Anonymous';
}

// Verify bug exists
$checkStmt = $pdo->prepare("SELECT id FROM bugs WHERE id = :id");
$checkStmt->execute([':id' => $bug_id]);
if (!$checkStmt->fetch()) {
    http_response_code(404);
    echo json_encode(['message' => 'Bug not found']);
    exit();
}

$stmt = $pdo->prepare("INSERT INTO comments (bug_id, author_name, text) VALUES (:bug_id, :author_name, :text)");
$stmt->execute([
    ':bug_id' => $bug_id,
    ':author_name' => $author_name,
    ':text' => $text
]);

$newId = $pdo->lastInsertId();
$getStmt = $pdo->prepare("SELECT * FROM comments WHERE id = :id");
$getStmt->execute([':id' => $newId]);
$comment = $getStmt->fetch();

http_response_code(201);
echo json_encode($comment);
?>
