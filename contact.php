from pathlib import Path

php = r'''<?php
// JOYOUS MINERAL CONTACT FORM
// Sends enquiries to: chirag.uidesigner@gmail.com

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '') {
    echo json_encode(['success'=>false, 'message'=>'Please enter your name.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success'=>false, 'message'=>'Please enter a valid email address.']);
    exit;
}

if ($phone === '') {
    echo json_encode(['success'=>false, 'message'=>'Please enter your phone number.']);
    exit;
}

if ($message === '') {
    echo json_encode(['success'=>false, 'message'=>'Please enter your message.']);
    exit;
}

/*
 * IMPORTANT:
 * The email goes to your Gmail address.
 * The From address is also your Gmail address, so no
 * joyousmineral.com email account is required.
 */
$to = 'chirag.uidesigner@gmail.com';

$subject = 'New Contact Enquiry - Joyous Mineral';

$body  = "New enquiry from Joyous Mineral website\n\n";
$body .= "Name: " . $name . "\n";
$body .= "Email: " . $email . "\n";
$body .= "Phone: " . $phone . "\n\n";
$body .= "Message:\n" . $message . "\n";

$headers  = "From: chirag.uidesigner@gmail.com\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $body, $headers)) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your message has been sent successfully.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'The server could not send the email. Your hosting must support PHP mail().'
    ]);
}
?>
'''

path = Path('/mnt/data/contact.php')
path.write_text(php, encoding='utf-8')

print("Created:", path)
