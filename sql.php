<?php
// file not synced by WinSCP or git

$servername = "localhost";
$username = "oispaeliitti";
$password = "dbpwd";
$dbname = "leaderboard";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset('latin1');

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
