<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'stats':
        getStats($pdo);
        break;
    case 'recent':
        getRecent($pdo);
        break;
    case 'trends':
        getTrends($pdo);
        break;
    default:
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid action. Use: stats, recent, trends']);
}

function getStats(PDO $pdo): void
{
    $stats = [];
    $queries = [
        'total' => "SELECT COUNT(*) as cnt FROM bugs",
        'open' => "SELECT COUNT(*) as cnt FROM bugs WHERE status = 'Open'",
        'inProgress' => "SELECT COUNT(*) as cnt FROM bugs WHERE status = 'In Progress'",
        'review' => "SELECT COUNT(*) as cnt FROM bugs WHERE status = 'Review'",
        'resolved' => "SELECT COUNT(*) as cnt FROM bugs WHERE status = 'Resolved'",
        'closed' => "SELECT COUNT(*) as cnt FROM bugs WHERE status = 'Closed'",
        'critical' => "SELECT COUNT(*) as cnt FROM bugs WHERE priority = 'Critical' AND status NOT IN ('Resolved', 'Closed')"
    ];

    foreach ($queries as $key => $sql) {
        $stmt = $pdo->query($sql);
        $stats[$key] = (int) $stmt->fetch()['cnt'];
    }

    echo json_encode($stats);
}

function getRecent(PDO $pdo): void
{
    $stmt = $pdo->query("
        SELECT b.*, u.name as assignee_name, u.role as assignee_role
        FROM bugs b
        LEFT JOIN users u ON b.assignee_id = u.id
        WHERE b.status != 'Closed'
        ORDER BY b.updated_at DESC, b.created_at DESC
        LIMIT 5
    ");

    echo json_encode($stmt->fetchAll());
}

function getTrends(PDO $pdo): void
{
    $priorities = ['Critical', 'High', 'Medium', 'Low'];
    $trends = [];

    foreach ($priorities as $priority) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM bugs WHERE priority = :priority");
        $stmt->execute([':priority' => $priority]);
        $trends[strtolower($priority)] = (int) $stmt->fetch()['cnt'];
    }

    echo json_encode($trends);
}
?>
