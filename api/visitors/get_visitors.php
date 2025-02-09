<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

// Query to fetch visitor details
$query = "SELECT id, fullname, rfid_number, contact, address, sector FROM visitors";
$result = mysqli_query($conn, $query);

if ($result) {
    $visitors = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $visitors[] = $row;
    }
    // Return the fetched visitor data as JSON
    echo json_encode([
        'success' => true,
        'visitors' => $visitors
    ]);
} else {
    // Failed to fetch visitors
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch visitors'
    ]);
}

mysqli_close($conn);
?>
