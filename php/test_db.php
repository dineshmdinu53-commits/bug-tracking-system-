<?php
require_once __DIR__ . '/db.php';
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['role'] = 'Reporter';

// Reset bug 1 to Closed
$pdo->query("UPDATE bugs SET status = 'Closed' WHERE id = 1");
$bug = $pdo->query("SELECT status, updated_at FROM bugs WHERE id = 1")->fetch();
echo "Before API Update: " . $bug['status'] . " at " . $bug['updated_at'] . "\n";

// Simulate sleep
sleep(1);

$_POST['id'] = 1;
$_POST['status'] = 'Open';
$_GET['action'] = 'update';

ob_start();
require __DIR__ . '/bugs.php';
$output = ob_get_clean();

$bug = $pdo->query("SELECT status, updated_at FROM bugs WHERE id = 1")->fetch();
echo "After API Update: " . $bug['status'] . " at " . $bug['updated_at'] . "\n";
echo "Output: " . $output . "\n";
