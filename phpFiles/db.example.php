<?php
// phpFiles/db.example.php
// TEMPLATE ONLY - do not use real credentials here.

$DB_HOST = 'localhost';
$DB_NAME = 'YOUR_CPANElUSER_pdga_store';   // e.g., interfa1_pdga_inventory
$DB_USER = 'YOUR_CPANElUSER_tduser';       // e.g., interfa1_tduser
$DB_PASS = 'CHANGE_ME_PASSWORD';           // placeholder only

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
