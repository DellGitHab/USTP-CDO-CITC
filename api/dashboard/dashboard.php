<?php
// CORS Headers to allow requests from the frontend (React app)
require_once '../../config/cors.php';
// Database connection
require_once '../../config/connection.php';

try {
    // Total Registered Employees
    $result = $conn->query("SELECT COUNT(*) AS total_employees FROM employees");
    $totalEmployees = $result->fetch_assoc()['total_employees'];

    // Total Registered Visitors
    $result = $conn->query("SELECT COUNT(*) AS total_visitors FROM visitors");
    $totalVisitors = $result->fetch_assoc()['total_visitors'];

    // Total Logs Today (Employees and Visitors)
    $result = $conn->query("
        SELECT 
            COUNT(CASE WHEN identification = 'personnel' THEN 1 END) AS employee_logs,
            COUNT(CASE WHEN identification = 'visitor' THEN 1 END) AS visitor_logs
        FROM monitoring
        WHERE DATE(date_entered) = CURDATE()
    ");
    $logsToday = $result->fetch_assoc();

    // Default sectors
    $sectors = [1, 2, 3, 4, 5];
    $sectorData = [];

    // Logs Today per Sector
    foreach ($sectors as $sector) {
        $stmt = $conn->prepare("
            SELECT 
                COUNT(CASE WHEN identification = 'personnel' THEN 1 END) AS employee_logs,
                COUNT(CASE WHEN identification = 'visitor' THEN 1 END) AS visitor_logs
            FROM monitoring
            WHERE sector = ? AND DATE(date_entered) = CURDATE()
        ");
        $stmt->bind_param("i", $sector);
        $stmt->execute();
        $sectorLogs = $stmt->get_result()->fetch_assoc();

        $sectorData[$sector] = [
            "employees" => $sectorLogs['employee_logs'] ?? 0,
            "visitors" => $sectorLogs['visitor_logs'] ?? 0,
        ];
    }

    // Respond with JSON
    echo json_encode([
        "totalEmployees" => $totalEmployees,
        "totalVisitors" => $totalVisitors,
        "logsToday" => [
            "employees" => $logsToday['employee_logs'] ?? 0,
            "visitors" => $logsToday['visitor_logs'] ?? 0,
        ],
        "sectors" => $sectorData,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>
