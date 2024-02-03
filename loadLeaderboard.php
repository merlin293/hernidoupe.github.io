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

// Dotaz na získání žebříčku seřazeného podle skóre s omezením na 10 záznamů
$sql = "SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10";

$result = $conn->query($sql);

$leaderboard = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = [
            'player' => $row['player'],
            'score' => $row['score'],
            'createdAt' => $row['created_at']
        ];
    }
}

// Uzavření spojení s databází
$conn->close();

// Výstup jako JSON
header('Content-Type: application/json');
echo json_encode($leaderboard);
?>
