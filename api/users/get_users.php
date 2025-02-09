<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

$query = "SELECT * FROM users";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode(["success" => true, "users" => $users]);
} else {
    echo json_encode(["success" => false, "users" => []]);
}
?>
