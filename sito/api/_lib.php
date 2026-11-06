<?php
// TERRE ASPRE — funzioni condivise da checkout, webhook Stripe, scorte e moduli.
// Le scorte vive stanno in api/dati/scorte-vive.json. sito/scorte.json è la base: se il suo campo "versione"
// è più alto di quello delle scorte vive, il file vince e sovrascrive i numeri (rifornimenti e correzioni a mano).

if (!defined('TERRE_ASPRE')) { http_response_code(403); exit; }

const DIR_DATI = __DIR__ . '/dati';
const FILE_BASE = __DIR__ . '/../scorte.json';
const FILE_VIVE = DIR_DATI . '/scorte-vive.json';
const FILE_SESSIONI = DIR_DATI . '/sessioni-pagate.txt';
const FILE_LOCK = DIR_DATI . '/scorte.lock';

// I prezzi validi sono solo questi: il browser manda codici e quantità, mai importi.
// Tenere allineato con PRODUCTS e SITE in sito/assets/app.js.
const CATALOGO = [
  'precoce-250' => ['nome' => 'TERRE ASPRE Precoce 250 ml', 'descrizione' => 'Coratina 100%, raccolta precoce, vetro scuro', 'cent' => 900],
  'precoce-500' => ['nome' => 'TERRE ASPRE Precoce 500 ml', 'descrizione' => 'Coratina 100%, raccolta precoce, vetro scuro', 'cent' => 1400],
  'precoce-box' => ['nome' => 'TERRE ASPRE Box 3 × 500 ml', 'descrizione' => 'Tre bottiglie da 500 ml', 'cent' => 3600],
  'quotidiano-3l' => ['nome' => 'TERRE ASPRE Quotidiano 3 L', 'descrizione' => 'Coratina 100%, bag-in-box', 'cent' => 5100],
  'mandorle-250' => ['nome' => 'TERRE ASPRE Mandorle in guscio 250 g', 'descrizione' => 'Mandorle in guscio', 'cent' => 450],
  'combo-mandorle' => ['nome' => 'TERRE ASPRE Combo olio + mandorle', 'descrizione' => 'Precoce 500 ml + mandorle in guscio 250 g', 'cent' => 1800],
];
const SOGLIA_GRATUITA_CENT = 3500;
const SPEDIZIONE_CENT = 690;
const MAX_QTY = 24;

// Prodotti senza scorte proprie: ogni pezzo venduto consuma questi pezzi di base.
// Tenere allineato con "componenti" in PRODUCTS (sito/assets/app.js).
const COMPONENTI = [
  'combo-mandorle' => ['precoce-500' => 1, 'mandorle-250' => 1],
];

class ErroreCarrello extends Exception {}

function config() {
  static $c = null;
  if ($c === null) {
    $file = __DIR__ . '/config.php';
    $c = is_file($file) ? require $file : [];
  }
  return $c;
}

function rispondi($dati, $stato = 200) {
  http_response_code($stato);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($dati, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

// Indirizzo del sito: da config.php se indicato, altrimenti dalla richiesta.
function origine() {
  $url = config()['url_sito'] ?? '';
  if ($url) return rtrim($url, '/');
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  return ($https ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
}

// ['combo-mandorle' => 2, 'precoce-500' => 1] → ['precoce-500' => 3, 'mandorle-250' => 2]
function espandi($righe) {
  $out = [];
  foreach ($righe as $id => $qty) {
    foreach (COMPONENTI[$id] ?? [$id => 1] as $base => $q) $out[$base] = ($out[$base] ?? 0) + $q * $qty;
  }
  return $out;
}

/* ---------- Scorte ---------- */

function leggiJson($file) {
  $testo = @file_get_contents($file);
  $dati = $testo === false ? null : json_decode($testo, true);
  return is_array($dati) ? $dati : null;
}

function scriviJson($file, $dati) {
  $tmp = $file . '.tmp';
  if (file_put_contents($tmp, json_encode($dati, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false || !rename($tmp, $file)) {
    throw new RuntimeException("Impossibile scrivere $file");
  }
}

// Esegue $fn con il blocco esclusivo sulle scorte: due pagamenti insieme non si sovrascrivono a vicenda.
function conBlocco($fn) {
  if (!is_dir(DIR_DATI)) mkdir(DIR_DATI, 0755, true);
  $h = fopen(FILE_LOCK, 'c');
  if (!$h || !flock($h, LOCK_EX)) throw new RuntimeException('Blocco delle scorte non disponibile');
  try { return $fn(); } finally { flock($h, LOCK_UN); fclose($h); }
}

// Scorte vive allineate con il file base. Da chiamare dentro conBlocco().
function statoScorte() {
  $base = leggiJson(FILE_BASE);
  if (!$base || !isset($base['prodotti'])) throw new RuntimeException('scorte.json non valido');
  $vive = leggiJson(FILE_VIVE);
  if (!$vive || (int)($base['versione'] ?? 0) > (int)($vive['versione'] ?? 0)) {
    $prodotti = [];
    foreach ($base['prodotti'] as $id => $n) $prodotti[$id] = max(0, (int)$n);
    $vive = ['versione' => (int)($base['versione'] ?? 0), 'prodotti' => $prodotti, 'aggiornato' => date('c')];
    scriviJson(FILE_VIVE, $vive);
  }
  $vive['sogliaPochi'] = (int)($base['sogliaPochi'] ?? 10);
  return $vive;
}

function leggiScorte() {
  $s = conBlocco('statoScorte');
  return ['sogliaPochi' => $s['sogliaPochi'], 'prodotti' => $s['prodotti'], 'aggiornato' => $s['aggiornato']];
}

// "2x precoce-500, 1x precoce-box" (metadata della sessione Checkout) → ['precoce-500' => 2, 'precoce-box' => 1]
function leggiCarrello($testo) {
  $out = [];
  foreach (explode(',', (string)$testo) as $parte) {
    if (preg_match('/^(\d+)x\s+([a-z0-9-]+)$/', trim($parte), $m)) $out[$m[2]] = ($out[$m[2]] ?? 0) + (int)$m[1];
  }
  return $out;
}

// Scala i pezzi venduti in una sessione pagata. Idempotente: Stripe può mandare lo stesso evento più volte.
// Restituisce i formati andati sotto zero (venduti oltre la disponibilità), da gestire a mano.
function scalaScorte($sessionId, $righe) {
  return conBlocco(function () use ($sessionId, $righe) {
    $fatte = is_file(FILE_SESSIONI) ? file(FILE_SESSIONI, FILE_IGNORE_NEW_LINES) : [];
    if (in_array($sessionId, $fatte, true)) return ['duplicato' => true, 'sovravenduti' => []];

    $s = statoScorte();
    unset($s['sogliaPochi']);
    $sovravenduti = [];
    foreach (espandi($righe) as $id => $qty) {
      $resta = ($s['prodotti'][$id] ?? 0) - $qty;
      if ($resta < 0) $sovravenduti[] = ['id' => $id, 'mancano' => -$resta];
      $s['prodotti'][$id] = max(0, $resta);
    }
    $s['aggiornato'] = date('c');
    scriviJson(FILE_VIVE, $s);
    file_put_contents(FILE_SESSIONI, $sessionId . "\n", FILE_APPEND);
    return ['duplicato' => false, 'sovravenduti' => $sovravenduti];
  });
}

/* ---------- Carrello e Stripe ---------- */

// Normalizza e controlla il carrello ricevuto dal browser.
function validaCarrello($items) {
  if (!is_array($items) || count($items) === 0) throw new ErroreCarrello('Il carrello è vuoto.');
  if (count($items) > 20) throw new ErroreCarrello('Troppe righe nel carrello.');
  $righe = [];
  foreach ($items as $i) {
    $id = is_array($i) ? ($i['id'] ?? null) : null;
    $qty = is_array($i) ? ($i['qty'] ?? null) : null;
    if (!is_string($id) || !isset(CATALOGO[$id])) throw new ErroreCarrello('Prodotto non riconosciuto.');
    if (!is_int($qty) || $qty < 1 || $qty > MAX_QTY) throw new ErroreCarrello('Quantità non valida.');
    $righe[] = ['id' => $id, 'qty' => $qty];
  }
  return $righe;
}

// Confronta il carrello con le scorte. Lancia ErroreCarrello se manca qualcosa.
function verificaScorte($items, $scorte) {
  $richiesti = [];
  foreach (validaCarrello($items) as $r) $richiesti[$r['id']] = ($richiesti[$r['id']] ?? 0) + $r['qty'];
  // la combo consuma pezzi di olio e di mandorle: si controlla sui pezzi di base
  foreach (espandi($richiesti) as $id => $qty) {
    $n = max(0, (int)($scorte['prodotti'][$id] ?? 0));
    $nome = CATALOGO[$id]['nome'];
    if ($n === 0) throw new ErroreCarrello("$nome è esaurito. Rimuovilo dal carrello per procedere.");
    if ($qty > $n) throw new ErroreCarrello("Di $nome restano solo $n pezzi, contando anche le combo nel carrello.");
  }
}

// Parametri della sessione Checkout; http_build_query li codifica nel formato di Stripe (a[b][0][c]=valore).
function parametriSessione($items, $origine) {
  $righe = validaCarrello($items);
  $subtotale = 0;
  foreach ($righe as $r) $subtotale += CATALOGO[$r['id']]['cent'] * $r['qty'];
  $gratis = $subtotale >= SOGLIA_GRATUITA_CENT;

  return [
    'mode' => 'payment',
    'locale' => 'it',
    'expires_at' => time() + 30 * 60, // il minimo di Stripe: limita il tempo fra controllo scorte e pagamento
    'success_url' => "$origine/grazie.html?session_id={CHECKOUT_SESSION_ID}",
    'cancel_url' => "$origine/carrello.html",
    'shipping_address_collection' => ['allowed_countries' => ['IT']],
    'phone_number_collection' => ['enabled' => 'true'],
    'billing_address_collection' => 'auto',
    'line_items' => array_map(function ($r) {
      $p = CATALOGO[$r['id']];
      return [
        'price_data' => ['currency' => 'eur', 'unit_amount' => $p['cent'], 'product_data' => ['name' => $p['nome'], 'description' => $p['descrizione']]],
        'quantity' => $r['qty'],
      ];
    }, $righe),
    'metadata' => ['carrello' => substr(implode(', ', array_map(function ($r) { return "{$r['qty']}x {$r['id']}"; }, $righe)), 0, 500)],
    'shipping_options' => [[
      'shipping_rate_data' => [
        'type' => 'fixed_amount',
        'display_name' => $gratis ? 'Spedizione gratuita' : 'Spedizione',
        'fixed_amount' => ['amount' => $gratis ? 0 : SPEDIZIONE_CENT, 'currency' => 'eur'],
      ],
    ]],
  ];
}

// Chiamata POST all'API di Stripe. Restituisce [codice HTTP, risposta decodificata].
function stripePost($percorso, $params, $chiave) {
  $ch = curl_init("https://api.stripe.com/v1/$percorso");
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($params),
    CURLOPT_HTTPHEADER => ["Authorization: Bearer $chiave", 'Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
  ]);
  $corpo = curl_exec($ch);
  $codice = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  if ($corpo === false) error_log('cURL verso Stripe: ' . curl_error($ch));
  curl_close($ch);
  return [$codice, $corpo === false ? null : json_decode($corpo, true)];
}

// Verifica la firma Stripe (header Stripe-Signature: t=...,v1=...) con HMAC-SHA256.
function verificaFirma($corpo, $header, $segreto, $tolleranzaSec = 300, $adesso = null) {
  if (!$header || !$segreto) return false;
  $t = null;
  $firme = [];
  foreach (explode(',', $header) as $parte) {
    $kv = explode('=', trim($parte), 2);
    if (count($kv) !== 2) continue;
    if ($kv[0] === 't') $t = $kv[1];
    if ($kv[0] === 'v1') $firme[] = $kv[1];
  }
  if ($t === null || !ctype_digit($t) || !$firme) return false;
  if (abs(($adesso ?? time()) - (int)$t) > $tolleranzaSec) return false;
  $atteso = hash_hmac('sha256', "$t.$corpo", $segreto);
  foreach ($firme as $f) if (hash_equals($atteso, $f)) return true;
  return false;
}

// Avviso via email all'indirizzo in config.php (ordini oltre la disponibilità, nuove richieste dai moduli).
function avvisa($oggetto, $testo, $rispondiA = null) {
  $c = config();
  if (empty($c['email_notifiche']) || empty($c['email_mittente'])) return false;
  $intestazioni = ['From: ' . $c['email_mittente'], 'Content-Type: text/plain; charset=utf-8'];
  if ($rispondiA && filter_var($rispondiA, FILTER_VALIDATE_EMAIL)) $intestazioni[] = "Reply-To: $rispondiA";
  return mail($c['email_notifiche'], '=?UTF-8?B?' . base64_encode($oggetto) . '?=', $testo, implode("\r\n", $intestazioni));
}
