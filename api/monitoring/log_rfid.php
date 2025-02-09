<?php
// Include necessary configurations and database connection
require '../../config/cors.php'; // Handle CORS for cross-origin requests
require_once '../../config/connection.php'; // Database connection

// Retrieve POST data
$rfid_number = isset($_POST['rfid_number']) ? trim($_POST['rfid_number']) : null;
$sector = isset($_POST['sector']) ? trim($_POST['sector']) : null;
$full_name = isset($_POST['full_name']) ? trim($_POST['full_name']) : null;
$contact = isset($_POST['contact']) ? trim($_POST['contact']) : null;
$identification = isset($_POST['identification']) ? trim($_POST['identification']) : null;

// Validate required fields
if (empty($rfid_number) || empty($sector)) {
    echo json_encode(['status' => 'error', 'message' => 'RFID number and sector are required']);
    exit;
}

// Initialize database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

// Check for connection errors
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

try {
    // Check if a record exists for today
    $query = "SELECT * FROM monitoring WHERE rfid_number = ? AND sector = ? AND date_entered = CURDATE()";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $rfid_number, $sector);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update the existing record with time_out
        $update = "UPDATE monitoring SET time_out = NOW() 
                   WHERE rfid_number = ? AND sector = ? AND date_entered = CURDATE()";
        $stmt = $conn->prepare($update);
        $stmt->bind_param("ss", $rfid_number, $sector);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Time out updated successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update time out']);
        }
    } else {
        // Insert a new record with time_in
        $insert = "INSERT INTO monitoring (rfid_number, full_name, contact, date_entered, time_in, identification, sector) 
                   VALUES (?, ?, ?, CURDATE(), NOW(), ?, ?)";
        $stmt = $conn->prepare($insert);
        $stmt->bind_param("sssss", $rfid_number, $full_name, $contact, $identification, $sector);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(['status' => 'success', 'message' => 'New record inserted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to insert new record']);
        }
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    // Close the database connection
    $stmt->close();
    $conn->close();
}
?>
