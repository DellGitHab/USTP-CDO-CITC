<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

// Query to fetch employee details
$query = "SELECT id, fullname, rfid_number, contact, address, sector FROM employees";
$result = mysqli_query($conn, $query);

if ($result) {
    $employees = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $employees[] = $row;
    }
    // Return the fetched employee data as JSON
    echo json_encode([
        'success' => true,
        'employees' => $employees
    ]);
} else {
    // Failed to fetch employees
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch employees'
    ]);
}

mysqli_close($conn);
?>
