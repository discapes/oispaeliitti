<?php
require_once("sql.php");

$stmt = $conn->prepare("SELECT COUNT(*) FROM topscores WHERE score > ?;");
$stmt->bind_param("i", $_POST["score"]);
$stmt->execute();
echo $stmt->get_result()->fetch_column() + 1;

?>
