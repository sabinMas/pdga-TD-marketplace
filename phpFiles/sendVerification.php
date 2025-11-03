<?php
/**
 * sendVerification.php
 * Accepts { "email": "<user@domain>" }, finds matching events in ../events.json,
 * creates a one-time token, stores it in phpFiles/tokens.json, and emails a
 * sign-in link back to signIn.html?token=...
 */
header('Content-Type: application/json');

$raw   = file_get_contents('php://input');
$data  = json_decode($raw, true);
$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
  exit;
}

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

$token  = bin2hex(random_bytes(32));
$expiry = time() + 24 * 60 * 60;

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

if (file_put_contents($tokensFile, json_encode($tokens, JSON_PRETTY_PRINT), LOCK_EX) === false) {
  echo json_encode(['success' => false, 'error' => 'Failed to persist token.']);
  exit;
}

$scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host      = $_SERVER['HTTP_HOST'];
$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\'); 
$basePath  = preg_replace('#/phpFiles$#', '', $scriptDir);  
$signin    = 'signIn.html';
$link      = "{$scheme}://{$host}{$basePath}/{$signin}?token=" . urlencode($token);

error_log("Verification link: $link");

$subject = 'Your PDGA Marketplace sign-in link';
$message = "Hi,\n\nClick the link below to verify your email and continue your order:\n\n{$link}\n\n"
         . "This link expires in 24 hours. If you didn’t request this, you can ignore this email.\n";
$from    = 'no-reply@' . preg_replace('/^www\./i', '', $host);

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: PDGA Marketplace <{$from}>\r\n";
$headers .= "Reply-To: {$from}\r\n";

@mail($email, $subject, $message, $headers);

echo json_encode(['success' => true]);
?>
