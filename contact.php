<?php
/**
 * Joyous Mineral — contact form handler
 * Receives the AJAX POST from index.html (#contact-form) and emails the
 * enquiry to the company inbox. Requires a working mail transport on the
 * host (most shared hosting has PHP mail() configured out of the box; on
 * your own server/VPS you may need sendmail/Postfix or to switch to SMTP —
 * see the note near ini_set('sendmail_from', ...) below).
 */

header('Content-Type: application/json; charset=utf-8');

// ---- configuration ---------------------------------------------------
$to_email      = 'chirag.uidesigner@gmail.com';
$site_name     = 'Joyous Mineral';
// A "from" address on YOUR OWN domain is strongly recommended once this
// site is live (e.g. no-reply@joyousmineral.com) — many mail servers
// reject or spam-flag mail claiming to be "from" an address it doesn't
// control (like the visitor's Gmail address).
$from_email    = 'no-reply@joyousmineral.com';

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// ---- basic request checks ---------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Invalid request method.');
}

// honeypot — bots fill every field, humans never see/fill this one
if (!empty($_POST['company_website'])) {
    // silently pretend success so bots don't retry
    respond(true, 'Message sent.');
}

// ---- collect + sanitize -------------------------------------------------
$name    = isset($_POST['name'])    ? trim(strip_tags($_POST['name']))    : '';
$email   = isset($_POST['email'])   ? trim($_POST['email'])               : '';
$phone   = isset($_POST['phone'])   ? trim(strip_tags($_POST['phone']))   : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

// ---- validate -----------------------------------------------------------
$errors = [];

if (mb_strlen($name) < 2) {
    $errors[] = 'name';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
if (!preg_match('/^[0-9+\-\s()]{7,16}$/', $phone)) {
    $errors[] = 'phone';
}
if (mb_strlen($message) < 10) {
    $errors[] = 'message';
}

if (!empty($errors)) {
    respond(false, 'Please check the following field(s): ' . implode(', ', $errors));
}

// header-injection guard on single-line fields
foreach ([$name, $email, $phone] as $field) {
    if (preg_match('/[\r\n]/', $field)) {
        respond(false, 'Invalid input detected.');
    }
}

// ---- compose email --------------------------------------------------
$subject = "New enquiry from $site_name website — $name";

$body  = "You have a new enquiry from the Joyous Mineral website.\n\n";
$body .= "Name:    $name\n";
$body .= "Phone:   $phone\n";
$body .= "Email:   $email\n";
$body .= "\nMessage:\n$message\n";
$body .= "\n---\nSubmitted: " . date('d M Y, H:i') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers   = [];
$headers[] = "From: $site_name Website <$from_email>";
$headers[] = "Reply-To: $name <$email>";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "Content-Type: text/plain; charset=UTF-8";

// ---- send -------------------------------------------------------------
$sent = @mail($to_email, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    respond(true, 'Thank you — your message has been sent. We will get back to you shortly.');
} else {
    // Common on local/dev servers with no mail transport configured.
    respond(false, 'We could not send your message right now. Please call +91 63544 00553 or email joyousmineral@gmail.com directly.');
}
