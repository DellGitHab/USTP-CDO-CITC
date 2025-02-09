<?php
require_once '../../config/connection.php';
require_once '../../config/cors.php';

// Ensure the `id` parameter is provided
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Employee ID not provided']);
    exit;
}

// Delete the employee by ID
$sql = "DELETE FROM employees WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete employee']);
}
?>
