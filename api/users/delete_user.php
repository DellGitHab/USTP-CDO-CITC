<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(["success" => false, "error" => "Invalid or missing ID"]);
    exit;
}

$id = intval($data['id']);

$query = "DELETE FROM users WHERE id=$id";

if ($conn->query($query)) {
    reorderIds($conn); // Reorder IDs
    // Fetch updated list of users
    $result = $conn->query("SELECT * FROM users");
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode(["success" => true, "users" => $users]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

function reorderIds($conn) {
    $conn->query("SET @new_id = 0");
    $conn->query("UPDATE users SET id = (@new_id := @new_id + 1)");
    $conn->query("ALTER TABLE users AUTO_INCREMENT = 1");
}

?>
