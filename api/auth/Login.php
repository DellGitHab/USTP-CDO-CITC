<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

$data = json_decode(file_get_contents("php://input"));
$username = $conn->real_escape_string($data->username);
$password_input = $conn->real_escape_string($data->password);

$sql = "SELECT id, username, password, role FROM users WHERE username='$username'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password_input, $row['password'])) {
        // Add loginTime to the response
        $row['loginTime'] = time(); // Current timestamp
        echo json_encode(["success" => true, "user" => $row]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid username"]);
}

$conn->close();
?>
