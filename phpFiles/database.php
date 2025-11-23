<?php
// phpFiles/db.php (REAL CREDENTIALS)

$DB_HOST = 'localhost';
$DB_NAME = 'interfa1_pdga_inventory';  // <-- your REAL DB name
$DB_USER = 'interfa1_pdga';          // <-- your REAL DB user
$DB_PASS = 'Pxg!k45P73*OWc';  // <-- paste your actual password

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    exit('Database connection failed: ' . $e->getMessage());
}
