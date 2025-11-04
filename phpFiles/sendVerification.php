<?php
/**
 * sendVerification.php (simplified)
 * Accept JSON { "email": "..." }, find events, create a token, save it,
 * and email a sign-in link to the requester.
 */
header('Content-Type: application/json');

function respond(array $payload)
{
  echo json_encode($payload);
  exit;
}

function load_json_file(string $path): ?array
{
  if (!is_file($path)) return null;
  $txt = @file_get_contents($path);
  if ($txt === false) return null;
  $data = json_decode($txt, true);
  return is_array($data) ? $data : null;
}

function save_json_file(string $path, array $data): bool
{
  $json = json_encode($data, JSON_PRETTY_PRINT);
  if ($json === false) return false;
  return file_put_contents($path, $json, LOCK_EX) !== false;
}

$input = json_decode(file_get_contents('php://input') ?: '', true);
$email = strtolower(trim($input['email'] ?? ''));
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(['success' => false, 'error' => 'Invalid email address.']);
}

$events = load_json_file(__DIR__ . '/../events.json');
if ($events === null) respond(['success' => false, 'error' => 'Events file missing or invalid.']);

$eventIds = [];
foreach ($events as $ev) {
  if (empty($ev['verifiedEmails']) || !is_array($ev['verifiedEmails'])) continue;
  $lower = array_map('strtolower', $ev['verifiedEmails']);
  if (in_array($email, $lower, true)) {
    $eventIds[] = $ev['eventID'] ?? null;
  }
}
$eventIds = array_values(array_filter(array_unique($eventIds), function ($v) { return $v !== null && $v !== ''; }));
if (empty($eventIds)) respond(['success' => false, 'error' => 'Email not recognized for any event.']);

try {
  $token = bin2hex(random_bytes(32));
} catch (Throwable $e) {
  respond(['success' => false, 'error' => 'Failed to generate token.']);
}

$tokensFile = __DIR__ . '/tokens.json';
$tokens = load_json_file($tokensFile) ?? [];
$tokens[] = [
  'token'    => $token,
  'email'    => $email,
  'eventIDs' => $eventIds,
  'expires'  => time() + 24 * 60 * 60,
];

if (!save_json_file($tokensFile, $tokens)) {
  respond(['success' => false, 'error' => 'Failed to persist token.']);
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
$basePath = preg_replace('#/phpFiles$#', '', $scriptDir);
$link = sprintf('%s://%s%s/signIn.html?token=%s', $scheme, $host, $basePath, rawurlencode($token));

error_log('Verification link: ' . $link);

$subject = 'Your PDGA Marketplace sign-in link';
$message = "Hi,\n\nClick the link below to verify your email and continue your order:\n\n{$link}\n\nThis link expires in 24 hours. If you didn't request this, you can ignore this email.\n";
$from = 'no-reply@' . preg_replace('/^www\./i', '', $host);
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: PDGA Marketplace <{$from}>\r\n";
$headers .= "Reply-To: {$from}\r\n";

$sent = mail($email, $subject, $message, $headers);
if (!$sent) error_log("Failed to send verification email to {$email}");

respond(['success' => true]);

?>

