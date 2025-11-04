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

// --- Helpers -------------------------------------------------------------
function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function load_tokens(string $path): ?array
{
    if (!is_file($path)) return null;
    $txt = @file_get_contents($path);
    if ($txt === false) return null;
    $data = json_decode($txt, true);
    return is_array($data) ? $data : null;
}

function save_tokens(string $path, array $tokens): bool
{
    $json = json_encode($tokens, JSON_PRETTY_PRINT);
    if ($json === false) return false;
    return file_put_contents($path, $json, LOCK_EX) !== false;
}

function find_token_index(array $tokens, string $token): ?int
{
    foreach ($tokens as $i => $rec) {
        if (isset($rec['token']) && is_string($rec['token']) && hash_equals($rec['token'], $token)) {
            return (int)$i;
        }
    }
    return null;
}

// --- Main ----------------------------------------------------------------
$token = isset($_GET['token']) ? trim((string)$_GET['token']) : '';
if ($token === '') respond(['success' => false, 'error' => 'Missing token.'], 400);

$tokensFile = __DIR__ . '/tokens.json';
$tokens = load_tokens($tokensFile);
if ($tokens === null) respond(['success' => false, 'error' => 'Invalid or expired token.'], 400);

$idx = find_token_index($tokens, $token);
if ($idx === null) respond(['success' => false, 'error' => 'Invalid or expired token.'], 400);

$record = $tokens[$idx];

// expiry check
if (!isset($record['expires']) || !is_numeric($record['expires']) || $record['expires'] < time()) {
    // remove expired token and persist
    array_splice($tokens, $idx, 1);
    save_tokens($tokensFile, $tokens);
    respond(['success' => false, 'error' => 'Token has expired.'], 410);
}

// single-use: remove token and persist
array_splice($tokens, $idx, 1);
if (!save_tokens($tokensFile, $tokens)) {
    // persist failed; log and continue (avoid leaking internal errors to caller)
    error_log("verify.php: failed to update tokens file: {$tokensFile}");
}

$email = $record['email'] ?? null;
$eventIDs = $record['eventIDs'] ?? [];
respond(['success' => true, 'email' => $email, 'eventIDs' => $eventIDs]);
?>