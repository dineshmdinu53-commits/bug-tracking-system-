<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = ['email' => 'admin@bugtracker.com', 'password' => 'admin123'];
require __DIR__ . '/login.php';
