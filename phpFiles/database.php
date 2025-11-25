<?php
// phpFiles/db.php (REAL CREDENTIALS)

$DB_HOST = 'localhost';
$DB_NAME = 'interfa1_pdga_inventory';  // <-- your REAL DB name
$DB_USER = 'interfa1_pdga';          // <-- your REAL DB user
$DB_PASS = 'Pxg!k45P73*OWc';  // <-- paste your actual password

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
}


$sql = "SELECT * FROM `items` "; // Example query
$result = $conn->query($sql);

    // ... (database connection and query execution code) ...

if ($result->num_rows > 0) {
    echo "<table>";
    echo "<tr><th>item</th><th>pirce</th><th>prodID</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row["product"] . "</td>";
        echo "<td>" . $row["price"] . "</td>";
        echo "<td>" . $row["prodID"] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "0 results";
}

// Close connection
$conn->close();

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    exit('Database connection failed: ' . $e->getMessage());
}
