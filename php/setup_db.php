<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $usersTableExists = (bool) $pdo->query("SHOW TABLES LIKE 'users'")->fetchColumn();
    if ($usersTableExists) {
        $passwordColumnExists = (bool) $pdo->query("SHOW COLUMNS FROM users LIKE 'password'")->fetchColumn();
        if (!$passwordColumnExists) {
            $pdo->exec("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '' AFTER email");
        }
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('Admin', 'Developer', 'Reporter') NOT NULL DEFAULT 'Reporter',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $bugsTableExists = (bool) $pdo->query("SHOW TABLES LIKE 'bugs'")->fetchColumn();
    if ($bugsTableExists) {
        $bugColumns = ['screenshot', 'code_snippet', 'updated_at', 'reporter_name'];
        foreach ($bugColumns as $column) {
            $exists = (bool) $pdo->query("SHOW COLUMNS FROM bugs LIKE '{$column}'")->fetchColumn();
            if ($exists) {
                continue;
            }

            if ($column === 'screenshot') {
                $pdo->exec("ALTER TABLE bugs ADD COLUMN screenshot VARCHAR(255) DEFAULT NULL");
            } elseif ($column === 'code_snippet') {
                $pdo->exec("ALTER TABLE bugs ADD COLUMN code_snippet TEXT DEFAULT NULL");
            } elseif ($column === 'updated_at') {
                $pdo->exec("ALTER TABLE bugs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            } elseif ($column === 'reporter_name') {
                $pdo->exec("ALTER TABLE bugs ADD COLUMN reporter_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous'");
            }
        }
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bugs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bug_id VARCHAR(20) NOT NULL UNIQUE,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
            status ENUM('Open', 'In Progress', 'Review', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
            assignee_id INT DEFAULT NULL,
            reporter_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
            screenshot VARCHAR(255) DEFAULT NULL,
            code_snippet TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_bugs_assignee_setup FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bug_id INT NOT NULL,
            author_name VARCHAR(100) NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_comments_bug_setup FOREIGN KEY (bug_id) REFERENCES bugs(id) ON DELETE CASCADE
        )
    ");

    $users = [
        ['Admin User', 'admin@bugtracker.com', 'admin123', 'Admin'],
        ['Dev User', 'dev@bugtracker.com', 'dev123', 'Developer'],
        ['Reporter User', 'reporter@bugtracker.com', 'reporter123', 'Reporter'],
    ];

    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, role)
        VALUES (:name, :email, :password, :role)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            password = VALUES(password),
            role = VALUES(role)
    ");

    foreach ($users as [$name, $email, $password, $role]) {
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => password_hash($password, PASSWORD_DEFAULT),
            ':role' => $role,
        ]);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Database schema verified and demo accounts are ready.',
        'accounts' => [
            ['email' => 'admin@bugtracker.com', 'password' => 'admin123', 'role' => 'Admin'],
            ['email' => 'dev@bugtracker.com', 'password' => 'dev123', 'role' => 'Developer'],
            ['email' => 'reporter@bugtracker.com', 'password' => 'reporter123', 'role' => 'Reporter'],
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database setup failed: ' . $e->getMessage(),
    ]);
}
?>
