<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ezmonitoring_bd";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
?>
