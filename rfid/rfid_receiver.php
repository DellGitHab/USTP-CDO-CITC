<?php
require_once '../config/connection.php';
require_once '../config/cors.php';
// Path to the current RFID file
$filePath = __DIR__ . '/current_rfid.txt';

// Check if an RFID value is received via POST
if (isset($_POST['rfid'])) {
    $rfid = trim($_POST['rfid']); // Get the RFID value and trim whitespace

    // Validate the RFID value is not empty
    if (!empty($rfid)) {
        // Write the RFID value to the file
        file_put_contents($filePath, $rfid);
        echo "RFID Tag Received: $rfid"; // Respond with success message
    } else {
        echo "Error: RFID value is empty"; // Respond with error
    }
} else {
    echo "Error: No RFID value received"; // Respond with error
}
?>
