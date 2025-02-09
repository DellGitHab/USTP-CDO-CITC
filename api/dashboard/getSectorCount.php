<?php
require_once '../../config/cors.php';
// Database connection
require_once '../../config/connection.php';
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Check and retrieve the sector parameter
if (!isset($_GET['sector'])) {
    error_log("Sector parameter is missing in the request: " . print_r($_GET, true));
    echo json_encode(["error" => "Sector parameter is missing."]);
    exit;
}

$sector = $conn->real_escape_string($_GET['sector']);

// Debugging: Log the sector parameter
error_log("Sector parameter received: $sector");

// Prepare SQL queries to fetch log counts for the given sector
$employeeLogsQuery = "SELECT COUNT(*) AS employees_logs FROM monitoring WHERE sector = '$sector' AND identification = 'employee'";
$visitorLogsQuery = "SELECT COUNT(*) AS visitors_logs FROM monitoring WHERE sector = '$sector' AND identification = 'visitor'";

// Fetch employee logs count
$employeeLogsResult = $conn->query($employeeLogsQuery);
if (!$employeeLogsResult) {
    error_log("Failed to fetch employee logs data: " . $conn->error);
    echo json_encode(["error" => "Failed to fetch employee logs data: " . $conn->error]);
    exit;
}
$employeeLogsData = $employeeLogsResult->fetch_assoc();

// Fetch visitor logs count
$visitorLogsResult = $conn->query($visitorLogsQuery);
if (!$visitorLogsResult) {
    error_log("Failed to fetch visitor logs data: " . $conn->error);
    echo json_encode(["error" => "Failed to fetch visitor logs data: " . $conn->error]);
    exit;
}
$visitorLogsData = $visitorLogsResult->fetch_assoc();

// Return the data as JSON
$response = [
    "sector" => $sector,
    "employees" => (int)$employeeLogsData['employees_logs'],
    "visitors" => (int)$visitorLogsData['visitors_logs']
];

echo json_encode($response);
?>
