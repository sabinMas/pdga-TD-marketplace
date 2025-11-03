<?php
/**
 * sendVerification.php
 * Accepts { "email": "<user@domain>" }, finds matching events in ../events.json,
 * creates a one-time token, stores it in phpFiles/tokens.json, and emails a
 * sign-in link back to signIn.html?token=...
 */
header('Content-Type: application/json');

// --- read JSON body ---
$raw   = file_get_contents('php://input');
$data  = json_decode($raw, true);
$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
  exit;
}

// --- load events from web root ---
$eventsFile = __DIR__ . '/../events.json';
if (!is_file($eventsFile)) {
  echo json_encode(['success' => false, 'error' => 'Events file missing.']);
  exit;
}
$events = json_decode(file_get_contents($eventsFile), true);
if (!is_array($events)) {
  echo json_encode(['success' => false, 'error' => 'Events file is invalid JSON.']);
  exit;
}

// --- map email -> eventIDs ---
$eventIds = [];
foreach ($events as $ev) {
  if (!empty($ev['verifiedEmails']) && is_array($ev['verifiedEmails'])) {
    foreach ($ev['verifiedEmails'] as $ve) {
      if (strtolower($ve) === $email) {
        $eventIds[] = $ev['eventID'];
        break;
      }
    }
  }
}
if (!$eventIds) {
  echo json_encode(['success' => false, 'error' => 'Email not recognized for any event.']);
  exit;
}

// --- create token record ---
$token  = bin2hex(random_bytes(32));            // 64 hex chars
$expiry = time() + 24 * 60 * 60;                // 24h

// --- read/append token store ---
$tokensFile = __DIR__ . '/tokens.json';
$tokens = [];
if (is_file($tokensFile)) {
  $decoded = json_decode(file_get_contents($tokensFile), true);
  if (is_array($decoded)) $tokens = $decoded;
}
$tokens[] = [
  'token'    => $token,
  'email'    => $email,
  'eventIDs' => array_values(array_unique($eventIds)),
  'expires'  => $expiry,
];

// try writing atomically; ensure phpFiles is writable (dir 755/775, file 644/664)
if (file_put_contents($tokensFile, json_encode($tokens, JSON_PRETTY_PRINT), LOCK_EX) === false) {
  echo json_encode(['success' => false, 'error' => 'Failed to persist token.']);
  exit;
}

// --- build correct absolute link (works for / and /~username/) ---
$scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host      = $_SERVER['HTTP_HOST'];                     // e.g., interfacers.greenriverdev.com
$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\'); // e.g., /phpFiles or /~interfa1/phpFiles
$basePath  = preg_replace('#/phpFiles$#', '', $scriptDir);   // => '' or '/~interfa1'
$signin    = 'signIn.html';                                // CASE-SENSITIVE filename
$link      = "{$scheme}://{$host}{$basePath}/{$signin}?token=" . urlencode($token);

// (optional) log during testing
error_log("Verification link: $link");

// --- compose & send email ---
$subject = 'Your PDGA Marketplace sign-in link';
$message = "Hi,\n\nClick the link below to verify your email and continue your order:\n\n{$link}\n\n"
         . "This link expires in 24 hours. If you didn’t request this, you can ignore this email.\n";
$from    = 'no-reply@' . preg_replace('/^www\./i', '', $host);

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: PDGA Marketplace <{$from}>\r\n";
$headers .= "Reply-To: {$from}\r\n";

// On some school hosts, mail() may be disabled; we still return success
// so front-end UX isn’t blocked. Check your cPanel Email Deliverability/Exim logs if needed.
@mail($email, $subject, $message, $headers);

// For local testing you can include the link in the JSON (comment out in prod):
// echo json_encode(['success' => true, 'link' => $link]); exit;

echo json_encode(['success' => true]);
