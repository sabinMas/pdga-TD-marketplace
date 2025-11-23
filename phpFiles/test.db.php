<?php
require __DIR__ . '/db.php';

echo "<pre>Trying DB connection...\n";

try {
    $version = $pdo->query('SELECT VERSION() AS v')->fetch();
    echo "Connected! MySQL version: " . $version['v'] . "\n";
    echo "Connection OK ✅";
} catch (PDOException $e) {
    echo "Query failed: " . $e->getMessage();
}

echo "</pre>";

