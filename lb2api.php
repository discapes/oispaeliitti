<?php
require_once("sql.php");
$sql = "SELECT * FROM `topscores` WHERE `score` > 2000 ORDER BY `score` DESC LIMIT 10;";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
} else {
  //echo "0 results";
}

while ($row = $result->fetch_assoc()) {
  if ($row["name"] == "anonymous") {
    echo "<tr>
    <td>" . $row['score'] . "</td>
    <td style=\"color:grey;\"><i>anonymous (public)</i></td>
    </tr>";
  } else {
    echo "<tr>
    <td>" . $row['score'] . "</td>
    <td>" . htmlspecialchars(utf8_encode($row["name"]), ENT_QUOTES, 'UTF-8') . "</td>
    </tr>";
  }
}
?>