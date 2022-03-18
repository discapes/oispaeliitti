<?php
require_once("sql.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nickname = array_key_exists("nickname", $_POST) ? utf8_decode($_POST["nickname"]) : null;
    $score = array_key_exists("highscore", $_POST) ? $_POST["highscore"] : null;
    $palaute = array_key_exists("palaute", $_POST) ? $_POST["palaute"] : null;

    if (!empty($palaute)) {
        $myfile = fopen("../palaute.txt", "a") or die("Unable to open file!");
        $txt = "$nickname ($score): $palaute \n\n";
        fwrite($myfile, $txt);
        fclose($myfile);
    }
}


$conn->close();
