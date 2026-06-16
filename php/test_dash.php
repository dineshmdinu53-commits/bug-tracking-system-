<?php
require_once __DIR__ . '/db.php';
$stmt = $pdo->query("SELECT id, title, status, updated_at FROM bugs ORDER BY updated_at DESC LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
