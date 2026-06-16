<?php
require __DIR__ . '/db.php';
$stmt = $pdo->query('SELECT email FROM users');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
