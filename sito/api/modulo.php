<?php
// TERRE ASPRE — riceve i moduli del sito (POST /api/modulo.php), li salva in api/dati/ e avvisa via email.

define('TERRE_ASPRE', true);
require __DIR__ . '/_lib.php';

// Moduli accettati e loro campi, nell'ordine in cui vanno salvati.
const MODULI = [
  'avvisami-cereali' => ['titolo' => 'Avvisami per i cereali', 'campi' => ['email', 'consenso']],
  'listino-professionisti' => ['titolo' => 'Richiesta listino professionisti', 'campi' => ['nome', 'attivita', 'tipo', 'citta', 'email', 'consumo', 'note']],
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') rispondi(['errore' => 'Metodo non consentito.'], 405);

$nome = $_POST['form-name'] ?? '';
if (!isset(MODULI[$nome])) rispondi(['errore' => 'Modulo non riconosciuto.'], 400);
// campo nascosto: lo compilano solo i programmi automatici
if (!empty($_POST['sito-web'])) rispondi(['ok' => true]);

$valori = [];
foreach (MODULI[$nome]['campi'] as $campo) {
  $v = trim(str_replace(["\r", "\n"], ' ', (string)($_POST[$campo] ?? '')));
  $valori[$campo] = mb_substr($v, 0, 1000);
}
if (!filter_var($valori['email'], FILTER_VALIDATE_EMAIL)) rispondi(['errore' => 'Indirizzo email non valido.'], 400);

try {
  if (!is_dir(DIR_DATI)) mkdir(DIR_DATI, 0755, true);
  $file = DIR_DATI . "/moduli-$nome.csv";
  $nuovo = !is_file($file);
  $h = fopen($file, 'a');
  if (!$h || !flock($h, LOCK_EX)) throw new RuntimeException("Impossibile scrivere $file");
  if ($nuovo) fputcsv($h, array_merge(['data'], MODULI[$nome]['campi']), ';');
  fputcsv($h, array_merge([date('Y-m-d H:i')], array_values($valori)), ';');
  flock($h, LOCK_UN);
  fclose($h);
} catch (Throwable $e) {
  error_log('Modulo: ' . $e->getMessage());
  rispondi(['errore' => 'Invio non riuscito. Riprova tra poco.'], 500);
}

$testo = '';
foreach ($valori as $campo => $v) $testo .= ucfirst($campo) . ": $v\n";
avvisa('TERRE ASPRE: ' . MODULI[$nome]['titolo'], $testo, $valori['email']);
rispondi(['ok' => true]);
