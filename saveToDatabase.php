<?php
// Připojení k databázi
$servername = "localhost";
$username = "id21856967_merlin293";
$password = "xY8#sDh!2pFz";
$dbname = "id21856967_herni_doupe";

$conn = new mysqli($servername, $username, $password, $dbname);

// Kontrola připojení
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Získání hodnoty z JSON data
$data = json_decode(file_get_contents('php://input'), true);
$player = $data['player'];
$score = $data['score'];

// Příprava a provedení dotazu na vložení hodnoty do databáze
$sql = "INSERT INTO leaderboard (player, score, created_at) VALUES ('$player', $score, NOW())";

if ($conn->query($sql) === TRUE) {
    echo "Hodnota byla úspěšně uložena do databáze.";
} else {
    echo "Chyba při ukládání do databáze: " . $conn->error;
}

// Uzavření spojení s databází
$conn->close();
?>
