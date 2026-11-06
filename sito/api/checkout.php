<?php
// TERRE ASPRE — crea una sessione Stripe Checkout a partire dal carrello (POST /api/checkout.php).
// Richiede stripe_secret_key in api/config.php (sk_test_... in prova, sk_live_... in produzione).

define('TERRE_ASPRE', true);
require __DIR__ . '/_lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') rispondi(['errore' => 'Metodo non consentito.'], 405);

$chiave = config()['stripe_secret_key'] ?? '';
if (!$chiave) rispondi(['errore' => 'Pagamento non configurato.'], 500);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) rispondi(['errore' => 'Richiesta non valida.'], 400);
$items = $body['items'] ?? null;

try {
  $scorte = leggiScorte();
} catch (Throwable $e) {
  error_log('Scorte non leggibili: ' . $e->getMessage());
  rispondi(['errore' => 'Non riusciamo a verificare la disponibilità. Riprova tra poco.'], 503);
}

try {
  verificaScorte($items, $scorte);
  $params = parametriSessione($items, origine());
} catch (ErroreCarrello $e) {
  $esaurito = strpos($e->getMessage(), 'esaurito') !== false || strpos($e->getMessage(), 'restano') !== false;
  rispondi(['errore' => $e->getMessage()], $esaurito ? 409 : 400);
}

list($codice, $dati) = stripePost('checkout/sessions', $params, $chiave);
if ($codice !== 200 || empty($dati['url'])) {
  error_log('Stripe: ' . ($dati['error']['message'] ?? "HTTP $codice"));
  rispondi(['errore' => 'Il pagamento non è disponibile in questo momento. Riprova tra poco.'], 502);
}
rispondi(['url' => $dati['url']]);
