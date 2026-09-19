<?php
/**
 * Joyous Mineral - Contact Form Handler
 *
 * IMPORTANT:
 * This PHP file must run on a PHP-enabled web host.
 * GitHub Pages / github.io does NOT execute PHP.
 */

header('Content-Type: application/json; charset=UTF-8');

$to_email   = 'chirag.uidesigner@gmail.com';
$site_name  = 'Joyous Mineral';
$from_email = 'no-reply@joyousmineral.com'; // Must exist on your live domain.

function respond($success, $message, $status = 200)
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.', 405);
}

/* Honeypot bot protection */
if (!empty($_POST['company_website'])) {
    respond(true, 'Thank you. Your message has been sent.');
}

/* Get form values */
$name    = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email   = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone   = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

/* Validation */
$errors = [];

if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = 'name';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}

if ($phone !== '' && !preg_match('/^[0-9+\-\s()]{7,20}$/', $phone)) {
    $errors[] = 'phone';
}

if ($message === '' || mb_strlen($message) < 10) {
    $errors[] = 'message';
}

if (!empty($errors)) {
    respond(
        false,
        'Please check the following field(s): ' . implode(', ', $errors),
        422
    );
}

/* Header-injection protection */
foreach ([$name, $email, $phone] as $field) {
    if (preg_match('/[\r\n]/', $field)) {
        respond(false, 'Invalid input detected.', 400);
    }
}

/* Email */
$subject = 'New Enquiry - Joyous Mineral Website';

$body  = "You have received a new enquiry from the Joyous Mineral website.\n\n";
$body .= "Name: " . $name . "\n";
$body .= "Phone: " . ($phone ?: 'Not provided') . "\n";
$body .= "Email: " . $email . "\n";
$body .= "\nMessage:\n" . $message . "\n";
$body .= "\n--------------------------------\n";
$body .= "Submitted: " . date('d M Y, H:i:s') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers = [
    'From: Joyous Mineral Website <' . $from_email . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION
];

$sent = mail(
    $to_email,
    $subject,
    $body,
    implode("\r\n", $headers)
);

if ($sent) {
    respond(true, 'Thank you! Your message has been sent successfully.');
}

respond(
    false,
    'We could not send your message right now. Please call +91 63544 00553 or email joyousmineral@gmail.com directly.',
    500
);
?>
