<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

// Reorder employee IDs
$sql = "SELECT id FROM employees ORDER BY id";
$result = mysqli_query($conn, $sql);

if ($result) {
    $i = 1; // Start from 1 or the first available ID
    while ($row = mysqli_fetch_assoc($result)) {
        $employeeId = $row['id'];
        // Update the ID to sequential order
        $updateSql = "UPDATE employees SET id = ? WHERE id = ?";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("ii", $i, $employeeId);
        $stmt->execute();
        $i++;
    }

    // After reordering IDs, reset the AUTO_INCREMENT to the next available ID
    $resetSql = "ALTER TABLE employees AUTO_INCREMENT = $i";
    if (mysqli_query($conn, $resetSql)) {
        echo json_encode(["success" => true, "message" => "IDs reordered and AUTO_INCREMENT reset successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to reset AUTO_INCREMENT"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Error reordering IDs"]);
}

mysqli_close($conn);
?>
