<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$username = $data['username'];
$email = $data['email'];
$role = $data['role'];
$password = isset($data['password']) && !empty($data['password']) ? password_hash($data['password'], PASSWORD_DEFAULT) : null;

// Update user details
$query = "UPDATE users SET username='$username', email='$email', role='$role' WHERE id=$id";
if ($conn->query($query)) {
    // Update password if provided
    if ($password) {
        $passwordQuery = "UPDATE users SET password='$password' WHERE id=$id";
        $conn->query($passwordQuery);
    }
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
function reorderIds($conn) {
    $conn->query("SET @new_id = 0");
    $conn->query("UPDATE users SET id = (@new_id := @new_id + 1)");
    $conn->query("ALTER TABLE users AUTO_INCREMENT = 1");
}

?>
