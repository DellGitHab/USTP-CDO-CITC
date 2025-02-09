<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$role = $data['role'];

$query = "INSERT INTO users (username, email, password, role) VALUES ('$username', '$email', '$password', '$role')";
if ($conn->query($query)) {
    $newUserId = $conn->insert_id; // Get the ID of the newly inserted user
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $newUserId,
            "username" => $username,
            "email" => $email,
            "role" => $role,
        ],
    ]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
?>
