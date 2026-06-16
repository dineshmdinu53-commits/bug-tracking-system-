<?php
header('Content-Type: application/json');
session_start();

// Allow developers, admins, reporters, users
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], ['Developer', 'Admin', 'Reporter', 'User'], true)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access Denied. You do not have permission to update bug status.']);
    exit();
}

// Use standard PDO connection from db.php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $bug_id = isset($_POST['bug_id']) ? (int)$_POST['bug_id'] : 0;
    $status = isset($_POST['status']) ? trim($_POST['status']) : '';

    $valid_statuses = ['Open', 'In Progress', 'Review', 'Resolved', 'Closed'];
    
    if ($bug_id <= 0 || !in_array($status, $valid_statuses)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid Bug ID or Status.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE bugs SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $bug_id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'success', 'message' => "Bug #$bug_id status successfully updated to $status."]);
        } else {
            echo json_encode(['status' => 'success', 'message' => "Bug #$bug_id status is already $status or bug not found."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error updating bug status: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
