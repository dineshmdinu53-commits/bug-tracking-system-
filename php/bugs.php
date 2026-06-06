<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$role = $_SESSION['role'] ?? '';

if (in_array($action, ['create', 'update', 'delete'], true)) {
    if ($action === 'create' && !in_array($role, ['Reporter', 'Admin'], true)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Access denied. Only Reporters and Admins can create bugs.']);
        exit();
    }

    if ($action === 'update' && !in_array($role, ['Developer', 'Admin', 'Reporter', 'User'], true)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Access denied.']);
        exit();
    }

    if ($action === 'delete' && $role !== 'Admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Access denied. Only Admins can delete bugs.']);
        exit();
    }
}

switch ($action) {
    case 'list':
        listBugs($pdo);
        break;
    case 'get':
        getBug($pdo);
        break;
    case 'create':
        createBug($pdo);
        break;
    case 'update':
        updateBug($pdo);
        break;
    case 'delete':
        deleteBug($pdo);
        break;
    default:
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}

function listBugs(PDO $pdo): void
{
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = max(1, min(50, (int) ($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;

    $status = trim($_GET['status'] ?? '');
    $priority = trim($_GET['priority'] ?? '');
    $assignee = trim($_GET['assignee'] ?? '');
    $search = trim($_GET['search'] ?? '');
    $tab = trim($_GET['tab'] ?? '');

    $where = [];
    $params = [];

    if ($status !== '' && $status !== 'All') {
        $where[] = 'b.status = :status';
        $params[':status'] = $status;
    }

    if ($priority !== '' && $priority !== 'All') {
        $where[] = 'b.priority = :priority';
        $params[':priority'] = $priority;
    }

    if ($assignee !== '' && $assignee !== 'Anyone') {
        $where[] = 'b.assignee_id = :assignee';
        $params[':assignee'] = $assignee;
    }

    if ($search !== '') {
        $where[] = '(b.title LIKE :search OR b.bug_id LIKE :search OR b.description LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    $sessionRole = $_SESSION['role'] ?? '';
    $sessionUserId = (int) ($_SESSION['user_id'] ?? 0);
    $sessionName = $_SESSION['name'] ?? '';

    if ($tab === 'my') {
        if ($sessionRole === 'Reporter') {
            $where[] = 'b.reporter_name = :reporter_name';
            $params[':reporter_name'] = $sessionName;
        } else {
            $where[] = 'b.assignee_id = :current_user_id';
            $params[':current_user_id'] = $sessionUserId;
        }
    } elseif ($tab === 'recent') {
        $where[] = 'b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    }

    if ($sessionRole === 'Developer' && $tab !== '') {
        if ($tab === 'recent') {
            $where[] = 'b.assignee_id = :developer_recent_user_id';
            $params[':developer_recent_user_id'] = $sessionUserId;
        }
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM bugs b $whereClause");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetch()['total'];

    $sql = "
        SELECT b.*, u.name as assignee_name, u.role as assignee_role
        FROM bugs b
        LEFT JOIN users u ON b.assignee_id = u.id
        $whereClause
        ORDER BY b.updated_at DESC, b.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        'bugs' => $stmt->fetchAll(),
        'pagination' => [
            'current' => $page,
            'pages' => max(1, (int) ceil($total / $limit)),
            'total' => $total,
            'limit' => $limit,
        ],
    ]);
}

function getBug(PDO $pdo): void
{
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Bug ID is required']);
        return;
    }

    $stmt = $pdo->prepare("
        SELECT b.*, u.name as assignee_name, u.email as assignee_email, u.role as assignee_role
        FROM bugs b
        LEFT JOIN users u ON b.assignee_id = u.id
        WHERE b.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $bug = $stmt->fetch();

    if (!$bug) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Bug not found']);
        return;
    }

    $commentStmt = $pdo->prepare("SELECT * FROM comments WHERE bug_id = :bug_id ORDER BY created_at ASC");
    $commentStmt->execute([':bug_id' => $id]);
    $bug['comments'] = $commentStmt->fetchAll();

    echo json_encode($bug);
}

function createBug(PDO $pdo): void
{
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $priority = ucfirst(strtolower(trim($_POST['priority'] ?? 'Medium')));
    $assigneeId = trim($_POST['assignee_id'] ?? '');
    $reporterName = trim($_POST['reporter_name'] ?? ($_SESSION['name'] ?? 'Anonymous'));
    $codeSnippet = trim($_POST['code_snippet'] ?? '');

    if ($title === '' || $description === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Title and description are required']);
        return;
    }

    $validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (!in_array($priority, $validPriorities, true)) {
        $priority = 'Medium';
    }

    $countStmt = $pdo->query("SELECT MAX(id) as max_id FROM bugs");
    $maxId = (int) ($countStmt->fetch()['max_id'] ?? 0);
    $bugId = '#BT-' . (2001 + $maxId);

    $screenshot = null;
    if (isset($_FILES['screenshot']) && $_FILES['screenshot']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $ext = strtolower(pathinfo($_FILES['screenshot']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (in_array($ext, $allowed, true)) {
            $filename = time() . '_' . random_int(1000, 9999) . '.' . $ext;
            if (move_uploaded_file($_FILES['screenshot']['tmp_name'], $uploadDir . $filename)) {
                $screenshot = 'php/uploads/' . $filename;
            }
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO bugs (bug_id, title, description, priority, assignee_id, reporter_name, screenshot, code_snippet)
        VALUES (:bug_id, :title, :description, :priority, :assignee_id, :reporter_name, :screenshot, :code_snippet)
    ");
    $stmt->execute([
        ':bug_id' => $bugId,
        ':title' => $title,
        ':description' => $description,
        ':priority' => $priority,
        ':assignee_id' => $assigneeId !== '' ? (int) $assigneeId : null,
        ':reporter_name' => $reporterName,
        ':screenshot' => $screenshot,
        ':code_snippet' => $codeSnippet !== '' ? $codeSnippet : null,
    ]);

    $newId = (int) $pdo->lastInsertId();
    $getStmt = $pdo->prepare("
        SELECT b.*, u.name as assignee_name, u.role as assignee_role
        FROM bugs b
        LEFT JOIN users u ON b.assignee_id = u.id
        WHERE b.id = :id
    ");
    $getStmt->execute([':id' => $newId]);

    http_response_code(201);
    echo json_encode($getStmt->fetch());
}

function updateBug(PDO $pdo): void
{
    $id = (int) ($_POST['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Bug ID is required']);
        return;
    }

    $fields = [];
    $params = [':id' => $id];

    if (array_key_exists('title', $_POST)) {
        $fields[] = 'title = :title';
        $params[':title'] = trim($_POST['title']);
    }

    if (array_key_exists('description', $_POST)) {
        $fields[] = 'description = :description';
        $params[':description'] = trim($_POST['description']);
    }

    if (array_key_exists('priority', $_POST)) {
        $priority = ucfirst(strtolower(trim($_POST['priority'])));
        $fields[] = 'priority = :priority';
        $params[':priority'] = $priority;
    }

    if (array_key_exists('status', $_POST)) {
        $fields[] = 'status = :status';
        $params[':status'] = trim($_POST['status']);
    }

    if (array_key_exists('assignee_id', $_POST)) {
        $fields[] = 'assignee_id = :assignee_id';
        $params[':assignee_id'] = $_POST['assignee_id'] !== '' ? (int) $_POST['assignee_id'] : null;
    }

    if (array_key_exists('code_snippet', $_POST)) {
        $fields[] = 'code_snippet = :code_snippet';
        $params[':code_snippet'] = trim($_POST['code_snippet']) !== '' ? $_POST['code_snippet'] : null;
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'No fields to update']);
        return;
    }

    $stmt = $pdo->prepare("UPDATE bugs SET " . implode(', ', $fields) . " WHERE id = :id");
    $stmt->execute($params);

    $getStmt = $pdo->prepare("
        SELECT b.*, u.name as assignee_name, u.role as assignee_role
        FROM bugs b
        LEFT JOIN users u ON b.assignee_id = u.id
        WHERE b.id = :id
    ");
    $getStmt->execute([':id' => $id]);

    echo json_encode($getStmt->fetch());
}

function deleteBug(PDO $pdo): void
{
    $id = (int) ($_POST['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Bug ID is required']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM bugs WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['status' => 'success', 'message' => 'Bug deleted successfully']);
}
?>
