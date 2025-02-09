<?php
// CORS Headers to allow requests from the frontend (React app)
require_once '../../config/cors.php';
// Database connection
require_once '../../config/connection.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Query to get the total number of visitors
$query = "SELECT COUNT(*) AS count FROM visitors";
$result = $conn->query($query);

if ($result) {
    $data = $result->fetch_assoc();
    header('Content-Type: application/json');
    echo json_encode($data);
} else {
    echo json_encode(["error" => "Query failed: " . $conn->error]);
}
?>
