<?php
require '../../config/cors.php';
require_once '../../config/connection.php';

// Get the sector from the query parameters
$sector = isset($_GET['sector']) ? $_GET['sector'] : '';

if ($sector === '') {
    echo json_encode(['success' => false, 'message' => 'Sector is required']);
    exit;
}

// Query to fetch logs based on the sector
$query = "SELECT rfid_number, full_name, contact, date_entered, time_in, time_out, identification 
          FROM moniroting 
          WHERE sector = '$sector' 
          ORDER BY date_entered DESC, time_in DESC";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Error executing query: ' . mysqli_error($conn)]);
    exit;
}

$logs = [];
while ($row = mysqli_fetch_assoc($result)) {
    $logs[] = $row;
}

if (count($logs) > 0) {
    echo json_encode(['success' => true, 'logs' => $logs]);
} else {
    echo json_encode(['success' => false, 'message' => 'No logs found']);
}
?>
