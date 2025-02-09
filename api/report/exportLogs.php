<?php
require_once '../../config/cors.php';
require_once '../../config/connection.php';

$format = $_GET['format'] ?? 'csv';
$dateFrom = $_GET['dateFrom'] ?? null;
$dateTo = $_GET['dateTo'] ?? null;
$sector = $_GET['sector'] ?? null;
$identification = $_GET['identification'] ?? null;
$nameOrRfid = $_GET['nameOrRfid'] ?? null;

$whereClauses = [];
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

$whereClause = count($whereClauses) > 0 ? "WHERE " . implode(" AND ", $whereClauses) : "";

$query = "
    SELECT id, rfid_number, fullname, contact, date_entered, time_in, time_out, sector, identification 
    FROM monitoring 
    $whereClause 
    ORDER BY date_entered DESC, time_in DESC
";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($paramTypes, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}

if ($format === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="logs.csv"');
    $output = fopen('php://output', 'w');
    fputcsv($output, ["ID", "RFID", "Name", "Contact", "Date", "Time In", "Time Out", "Sector", "Identification"]);
    foreach ($logs as $log) {
        fputcsv($output, $log);
    }
    fclose($output);
} elseif ($format === 'excel') {
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="logs.xls"');
    echo "ID\tRFID\tName\tContact\tDate\tTime In\tTime Out\tSector\tIdentification\n";
    foreach ($logs as $log) {
        echo implode("\t", $log) . "\n";
    }
}

$conn->close();
?>
