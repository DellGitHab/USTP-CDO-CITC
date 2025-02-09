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
    $rfid_number = $conn->real_escape_string($data->rfid_number);
    $contact = $conn->real_escape_string($data->contact);
    $address = $conn->real_escape_string($data->address);
    $sector = $conn->real_escape_string($data->sector);

    // Prepare SQL statement to insert the employee data
    $sql = "INSERT INTO employees (fullname, rfid_number, contact, address, sector) 
            VALUES ('$fullname', '$rfid_number', '$contact', '$address', '$sector')";

    if ($conn->query($sql) === TRUE) {
        // Successfully added the employee
        
        // Clear the RFID file after successful insertion
        if (file_exists($rfidFilePath)) {
            file_put_contents($rfidFilePath, ''); // Write an empty string to the file
        }

        // Return success response
        $response = array('success' => true, 'message' => 'Employee added successfully.');
        echo json_encode($response);
    } else {
        // Failed to insert the data
        $response = array('success' => false, 'message' => 'Failed to add employee: ' . $conn->error);
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
