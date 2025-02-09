<?php
require_once '../config/connection.php';
require_once '../config/cors.php';

// Path to the current RFID file
$filePath = __DIR__ . '/current_rfid.txt';

// Check if the file exists
if (file_exists($filePath)) {
    // Read the content of the file
    $rfid = file_get_contents($filePath);

    // Validate if the file contains an RFID value
    if (!empty($rfid)) {
        echo $rfid; // Respond with the current RFID value
    } else {
        echo "No RFID"; // Respond with "No RFID" if the file is empty
    }
} else {
    echo "No RFID"; // Respond with "No RFID" if the file does not exist
}
?>
