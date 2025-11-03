<?php
/**
 * verify.php
 *
 * This script accepts a "token" query parameter, looks it up in a local
 * tokens.json file, checks for expiry, and returns the associated email and
 * event IDs in JSON if valid. Otherwise, it reports an error. The token is
 * removed after validation to prevent reuse. This simple implementation is
 * intended for demonstration; in production, store tokens in a database and
 * secure the endpoint with HTTPS.
 */
header('Content-Type: application/json');

// Retrieve token from the query string
$token = isset($_GET['token']) ? trim($_GET['token']) : '';
if (!$token) {
    echo json_encode(['success' => false, 'error' => 'Missing token.']);
    exit;
}

$tokensFile = __DIR__ . '/tokens.json';
if (!file_exists($tokensFile)) {
    echo json_encode(['success' => false, 'error' => 'Invalid or expired token.']);
    exit;
}

$tokens = json_decode(file_get_contents($tokensFile), true);
if (!is_array($tokens)) {
    echo json_encode(['success' => false, 'error' => 'Invalid or expired token.']);
    exit;
}

// Find the token
$foundIndex = null;
for ($i = 0; $i < count($tokens); $i++) {
    if (isset($tokens[$i]['token']) && $tokens[$i]['token'] === $token) {
        $foundIndex = $i;
        break;
    }
}
if ($foundIndex === null) {
    echo json_encode(['success' => false, 'error' => 'Invalid or expired token.']);
    exit;
}
$record = $tokens[$foundIndex];

// Check expiry
if (!isset($record['expires']) || $record['expires'] < time()) {
    // Remove expired token
    array_splice($tokens, $foundIndex, 1);
    file_put_contents($tokensFile, json_encode($tokens, JSON_PRETTY_PRINT));
    echo json_encode(['success' => false, 'error' => 'Token has expired.']);
    exit;
}

// Remove token after use
array_splice($tokens, $foundIndex, 1);
file_put_contents($tokensFile, json_encode($tokens, JSON_PRETTY_PRINT));

// Return the email and event IDs
$email = isset($record['email']) ? $record['email'] : null;
$eventIDs = isset($record['eventIDs']) ? $record['eventIDs'] : [];
echo json_encode(['success' => true, 'email' => $email, 'eventIDs' => $eventIDs]);
?>