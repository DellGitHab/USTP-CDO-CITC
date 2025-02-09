<?php
// Include database connection
require_once '../../config/connection.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sector = $_GET['sector'] ?? 'entrance'; // Default to '0' for entrance

    try {
        // Fetch logs based on sector
        $stmt = $conn->prepare("SELECT * FROM monitoring WHERE sector = ? ORDER BY date_entered DESC, time_in DESC");
        $stmt->bind_param("i", $sector);
        $stmt->execute();
        $result = $stmt->get_result();

        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }

        echo json_encode(["success" => true, "logs" => $logs]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
