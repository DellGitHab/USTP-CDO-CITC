<?php
require_once '../../config/cors.php';
require_once '../../config/connection.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 15; // Number of logs per page
$offset = ($page - 1) * $limit;

$dateFrom = $_GET['dateFrom'] ?? null;
$dateTo = $_GET['dateTo'] ?? null;
$sector = $_GET['sector'] ?? null;
$identification = $_GET['identification'] ?? null;
$nameOrRfid = $_GET['nameOrRfid'] ?? null;
$stillInside = isset($_GET['stillInside']) ? (int)$_GET['stillInside'] : 0;
$undertime = isset($_GET['undertime']) ? (int)$_GET['undertime'] : 0; // New undertime filter

$whereClauses = [];
$params = [];
$paramTypes = "";

// Filters
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
if ($sector) {
    $whereClauses[] = "sector = ?";
    $params[] = $sector;
    $paramTypes .= "s";
}
if ($identification) {
    $whereClauses[] = "identification = ?";
    $params[] = $identification;
    $paramTypes .= "s";
}
if ($nameOrRfid) {
    $whereClauses[] = "(fullname LIKE ? OR rfid_number LIKE ?)";
    $params[] = "%$nameOrRfid%";
    $params[] = "%$nameOrRfid%";
    $paramTypes .= "ss";
}

// "Still Inside" filter (checks for NULL in time_out)
if ($stillInside === 1) {
    $whereClauses[] = "time_out IS NULL";
}

// Combine where clauses
$whereClause = count($whereClauses) > 0 ? "WHERE " . implode(" AND ", $whereClauses) : "";

// Count total logs for pagination
if ($undertime === 1) {
    // Count logs with undertime
    $query = "
        SELECT COUNT(DISTINCT rfid_number, date_entered) AS total
        FROM monitoring 
        WHERE sector = 'entrance'
        AND time_in IS NOT NULL AND time_out IS NOT NULL
        GROUP BY rfid_number, date_entered
        HAVING SUM(TIMESTAMPDIFF(SECOND, CONCAT(date_entered, ' ', time_in), CONCAT(date_entered, ' ', time_out))) < 28800
    ";
} else {
    // Count total logs for pagination
    $query = "SELECT COUNT(*) AS total FROM monitoring $whereClause";
}
$stmt = $conn->prepare($query);
if (!empty($params) && $undertime !== 1) {
    $stmt->bind_param($paramTypes, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();
$totalLogs = $result->fetch_assoc()['total'];
$totalPages = ceil($totalLogs / $limit);

// Fetch logs
if ($undertime === 1) {
    // Query for logs with undertime
    $query = "
        SELECT rfid_number, fullname, date_entered, 
               SUM(TIMESTAMPDIFF(SECOND, CONCAT(date_entered, ' ', time_in), CONCAT(date_entered, ' ', time_out))) AS total_seconds
        FROM monitoring 
        WHERE sector = 'entrance'
        AND time_in IS NOT NULL AND time_out IS NOT NULL
        GROUP BY rfid_number, date_entered
        HAVING total_seconds < 28800
        ORDER BY date_entered DESC
        LIMIT $limit OFFSET $offset
    ";
} else {
    // Query for normal logs
    $query = "
        SELECT id, rfid_number, fullname, contact, date_entered, time_in, time_out, sector, identification 
        FROM monitoring 
        $whereClause 
        ORDER BY date_entered DESC, time_in DESC 
        LIMIT $limit OFFSET $offset
    ";
}

$stmt = $conn->prepare($query);
if (!empty($params) && $undertime !== 1) {
    $stmt->bind_param($paramTypes, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    if ($undertime === 1) {
        $row['total_time'] = gmdate("H:i:s", $row['total_seconds']); // Format total time
        unset($row['total_seconds']);
    }
    $logs[] = $row;
}

// Return logs and pagination details
echo json_encode([
    "logs" => $logs,
    "totalPages" => $totalPages,
]);

$conn->close();
?>
