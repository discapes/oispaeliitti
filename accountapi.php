<?php
require_once("sql.php");
require_once("profanity.php");
use DeveloperDino\ProfanityFilter\Check;
$check = new Check();

function uniqidReal($lenght = 13)
{
    // uniqid gives 13 chars, but you could adjust it to your needs.
    if (function_exists("random_bytes")) {
        $bytes = random_bytes(ceil($lenght / 2));
    } elseif (function_exists("openssl_random_pseudo_bytes")) {
        $bytes = openssl_random_pseudo_bytes(ceil($lenght / 2));
    } else {
        throw new Exception("no cryptographically secure random function available");
    }
    return substr(bin2hex($bytes), 0, $lenght);
}

function updateScore($uuid, $nickname, $score)
{
    if (gettype(detailsCorrect($uuid, $nickname)) == "integer") {
        global $conn;
        $stmt = $conn->prepare("UPDATE topscores SET score=? WHERE uuid=? AND name=? AND score<?;");
        $stmt->bind_param("issi", $score, $uuid, $nickname, $score);
        $stmt->execute();
    }
}

function detailsCorrect($uuid, $nickname)
{
    // return score
    global $conn;
    $stmt = $conn->prepare("SELECT score FROM topscores WHERE uuid=? AND name=?;");
    $stmt->bind_param("ss", $uuid, $nickname);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_column();
    return $result;
}

function accExists($nickname)
{
    // does account exist
    global $check;
    if ($check->hasProfanity($nickname)) {
        return true;
    } else {
        global $conn;
        $stmt = $conn->prepare("SELECT EXISTS(SELECT * FROM topscores WHERE name=?);");
        $stmt->bind_param("s", $nickname);
        $stmt->execute();
        return $stmt->get_result()->fetch_column() === 1;
    }
}

function createAcc($uuid, $nickname)
{
    global $conn;
    $stmt = $conn->prepare("INSERT INTO topscores VALUES (?, ?, 0);");
    $stmt->bind_param("ss", $uuid, $nickname);
    $stmt->execute();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $uuid = array_key_exists("uuid", $_POST) ? $_POST["uuid"] : null;
    $nickname = array_key_exists("nickname", $_POST) ? utf8_decode($_POST["nickname"]) : null;
    $score = array_key_exists("score", $_POST) ? $_POST["score"] : null;

    if ($score != null) {
        // update attempt
        if ($nickname == "anonymous" || $nickname == null) {
            updateScore("9f39aa0ecd89d", "anonymous", $score);
        } else {
            updateScore($uuid, $nickname, $score);
        }
    } else if ($uuid != null && !empty($nickname)) { // score == null
        // auth test
        $result = detailsCorrect($uuid, $nickname);
        echo $result;
    } else if (!empty($nickname)) { // uuid = null
        // new acc attempt
        if (accExists($nickname)) {
        } else {
            $newuuid = uniqidReal();
            createAcc($newuuid, $nickname);
            echo $newuuid;
        }
    }
}

/*
$sql = "SELECT uuid, name, score FROM topscores";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<br>". $row["uuid"]. " - ". utf8_encode($row["name"]). " - " . $row["score"] . "<br>";
    }
} else {
    echo "0 results";
}
*/
$conn->close();
