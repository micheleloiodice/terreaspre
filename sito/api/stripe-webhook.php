<?php
// TERRE ASPRE — riceve gli eventi di Stripe e scala le scorte a ogni pagamento riuscito (POST /api/stripe-webhook.php).
// Richiede stripe_webhook_secret in api/config.php (whsec_...).

define('TERRE_ASPRE', true);
require __DIR__ . '/_lib.php';

const EVENTI_PAGATI = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

function fine($testo, $stato = 200) {
  http_response_code($stato);
  header('Content-Type: text/plain; charset=utf-8');
  echo $testo;
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fine('Metodo non consentito', 405);
$segreto = config()['stripe_webhook_secret'] ?? '';
if (!$segreto) fine('Webhook non configurato', 500);

$corpo = file_get_contents('php://input');
if (!verificaFirma($corpo, $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '', $segreto)) fine('Firma non valida', 400);

$evento = json_decode($corpo, true);
$sessione = $evento['data']['object'] ?? null;
if (!in_array($evento['type'] ?? '', EVENTI_PAGATI, true) || ($sessione['payment_status'] ?? '') !== 'paid') fine('ignorato');

try {
  $esito = scalaScorte($sessione['id'], leggiCarrello($sessione['metadata']['carrello'] ?? ''));
} catch (Throwable $e) {
  error_log('Webhook: ' . $e->getMessage());
  fine('Errore', 500); // Stripe riprova da solo
}

if ($esito['sovravenduti']) {
  // Due clienti hanno comprato gli ultimi pezzi insieme: l'ordine va gestito o rimborsato a mano.
  $dettaglio = implode(', ', array_map(function ($s) { return "{$s['id']}: mancano {$s['mancano']}"; }, $esito['sovravenduti']));
  error_log("SOVRAVENDITA {$sessione['id']} $dettaglio");
  file_put_contents(DIR_DATI . '/sovravendite.log', date('c') . " {$sessione['id']} $dettaglio\n", FILE_APPEND);
  avvisa('TERRE ASPRE: ordine oltre la disponibilità', "Il pagamento {$sessione['id']} supera le scorte.\n$dettaglio\n\nControllalo nella dashboard di Stripe.");
}
fine('ok');
