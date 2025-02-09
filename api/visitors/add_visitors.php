<?php
// CORS Headers to allow requests from the frontend (React app)
require_once '../../config/cors.php';

// Database connection
require_once '../../config/connection.php';

// Path to the RFID file
$rfidFilePath = '../../rfid/current_rfid.txt';

// Read the JSON input data
$data = json_decode(file_get_contents("php://input"));

// Check if data is not null
if ($data) {
    // Escape incoming data to prevent SQL injection
    $fullname = $conn->real_escape_string($data->fullname);
    $contact = $conn->real_escape_string($data->contact);
    $address = $conn->real_escape_string($data->address);
    $sector = $conn->real_escape_string($data->sector);

    // Read the RFID number from the RFID file
    if (file_exists($rfidFilePath)) {
        $rfid_number = trim(file_get_contents($rfidFilePath)); // Trim to remove extra spaces or line breaks

        if (empty($rfid_number)) {
            // If RFID file is empty, return an error
            $response = array('success' => false, 'message' => 'No RFID scanned. Please scan the RFID and try again.');
            echo json_encode($response);
            exit;
        }

        // Prepare SQL statement to insert the visitor data
        $sql = "INSERT INTO visitors (fullname, rfid_number, contact, address, sector) 
                VALUES ('$fullname', '$rfid_number', '$contact', '$address', '$sector')";

        if ($conn->query($sql) === TRUE) {
            // Successfully added the visitor
            $visitor_id = $conn->insert_id; // Get the ID of the inserted visitor

            // Prepare SQL statement to update the visitor_rfid table with the latest visitor
            // and set the expiration_datetime to the end of the current day
            $updateSql = "INSERT INTO visitor_rfid (rfid_number, last_visitor_id, expiration_datetime) 
                          VALUES ('$rfid_number', $visitor_id, CONCAT(CURDATE(), ' 23:59:59')) 
                          ON DUPLICATE KEY UPDATE 
                          last_visitor_id = $visitor_id, 
                          expiration_datetime = CONCAT(CURDATE(), ' 23:59:00')";

            if ($conn->query($updateSql) === TRUE) {
                // Clear the RFID file after successful insertion
                file_put_contents($rfidFilePath, ''); // Write an empty string to the file

                // Return success response
                $response = array('success' => true, 'message' => 'Visitor added successfully.');
                echo json_encode($response);
            } else {
                // Failed to update the visitor_rfid table
                $response = array('success' => false, 'message' => 'Failed to update RFID mapping: ' . $conn->error);
                echo json_encode($response);
            }
        } else {
            // Failed to insert the data into visitors table
            $response = array('success' => false, 'message' => 'Failed to add visitor: ' . $conn->error);
            echo json_encode($response);
        }
    } else {
        // RFID file not found
        $response = array('success' => false, 'message' => 'RFID file not found.');
        echo json_encode($response);
    }
} else {
    // Invalid input data
    $response = array('success' => false, 'message' => 'Invalid input data.');
    echo json_encode($response);
}

// Close the connection
$conn->close();
?>
