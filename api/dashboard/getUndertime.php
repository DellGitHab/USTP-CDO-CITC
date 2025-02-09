<?php
require_once '../../config/cors.php';
require_once '../../config/connection.php';

$dateFrom = $_GET['dateFrom'] ?? null;
$dateTo = $_GET['dateTo'] ?? null;

$whereClauses = ["sector = 'entrance'", "time_in IS NOT NULL", "time_out IS NOT NULL", "identification = 'personnel'"]; // Added filter for personnel
$params = [];
$paramTypes = "";

if ($dateFrom) {
    $whereClauses[] = "date_entered >= ?";
    $params[] = $dateFrom;
    $paramTypes .= "s";
}

if ($dateTo) {
    $whereClauses[] = "date_entered <= ?";
    $params[] = $dateTo;
    $paramTypes .= "s";
}

$whereClause = count($whereClauses) > 0 ? "WHERE " . implode(" AND ", $whereClauses) : "";

// Fetch undertime logs for personnel only
$query = "
    SELECT rfid_number, fullname, date_entered, 
           SUM(TIMESTAMPDIFF(SECOND, CONCAT(date_entered, ' ', time_in), CONCAT(date_entered, ' ', time_out))) AS total_seconds
    FROM monitoring 
    $whereClause
    GROUP BY rfid_number, date_entered
    HAVING total_seconds < 28800
    ORDER BY date_entered DESC
";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($paramTypes, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    $row['total_time'] = gmdate("H:i:s", $row['total_seconds']); 
    unset($row['total_seconds']);
    $logs[] = $row;
}

// Return undertime logs for personnel only
echo json_encode(["logs" => $logs]);

$conn->close();
?>
