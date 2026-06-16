<?php
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['role'] = 'Admin';
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST['code_snippet'] = 'function test() { echo "hello" }';
require __DIR__ . '/ai_fix.php';
