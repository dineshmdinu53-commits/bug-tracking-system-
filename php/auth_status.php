<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'loggedIn' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['name'],
            'role' => $_SESSION['role'],
            'email' => $_SESSION['email']
        ]
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
