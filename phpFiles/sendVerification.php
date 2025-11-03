<?php
/**
 * sendVerification.php
 *
 * This script accepts a JSON payload containing an email address and, if the email
 * matches one or more events in events.json, generates a one‑time verification
 * token, stores it with an expiry, sends the user an email containing a
 * verification link, and returns a JSON response. The link directs back to
 * signIn.html with the token appended as a query parameter.
 *
 * NOTE: This implementation writes tokens to a local tokens.json file and
 * uses PHP's built‑in mail() function for simplicity. In a production
 * environment, you should use a proper database and an email service
 * provider for reliability and security.
 */
header('Content-Type: application/json');

// Parse JSON input
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';

// Basic email validation
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
    exit;
}

// Load events and find all event IDs associated with this email
$eventsFile = __DIR__ . '/../events.json';
if (!file_exists($eventsFile)) {
    echo json_encode(['success' => false, 'error' => 'Events file missing.']);
    exit;
}
$events = json_decode(file_get_contents($eventsFile), true);
$eventIds = [];
foreach ($events as $event) {
    if (!empty($event['verifiedEmails']) && is_array($event['verifiedEmails'])) {
        foreach ($event['verifiedEmails'] as $ve) {
            if (strtolower($ve) === $email) {
                $eventIds[] = $event['eventID'];
            }
        }
    }
}
if (empty($eventIds)) {
    echo json_encode(['success' => false, 'error' => 'Email not recognized for any event.']);
    exit;
}

// Generate a random token (64 hex characters = 256 bits)
$token = bin2hex(random_bytes(32));
$expiry = time() + 24 * 60 * 60; // 24 hours from now

// Load existing tokens
$tokensFile = __DIR__ . '/tokens.json';
$tokens = [];
if (file_exists($tokensFile)) {
    $tokens = json_decode(file_get_contents($tokensFile), true);
    if (!is_array($tokens)) {
        $tokens = [];
    }
}
// Append this new token record
$tokens[] = [
    'token' => $token,
    'email' => $email,
    'eventIDs' => $eventIds,
    'expires' => $expiry,
];
file_put_contents($tokensFile, json_encode($tokens, JSON_PRETTY_PRINT));

// Build a verification link back to the sign‑in page
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$path = dirname($_SERVER['REQUEST_URI']);
$link = rtrim($protocol . '://' . $host . $path, '/') . '/signIn.html?token=' . urlencode($token);
// Send an email containing the verification link
$subject = 'PDGA Marketplace: Verify your email';
$message = "Click the link below to verify your email and access your event recommendations:\n\n" . $link . "\n\nIf you did not request this, please ignore this email.";
$headers = 'From: no-reply@pdga-marketplace.com' . "\r\n" .
           'Reply-To: no-reply@pdga-marketplace.com' . "\r\n" .
           'X-Mailer: PHP/' . phpversion();
// Suppress errors from mail() as this is just an example. In production, handle failures appropriately.
@mail($email, $subject, $message, $headers);

echo json_encode(['success' => true]);
?>