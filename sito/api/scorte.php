<?php
// TERRE ASPRE — scorte attuali per il sito (GET /api/scorte.php). Solo lettura.

define('TERRE_ASPRE', true);
require __DIR__ . '/_lib.php';

try {
  rispondi(leggiScorte());
} catch (Throwable $e) {
  error_log('Scorte: ' . $e->getMessage());
  rispondi(['errore' => 'Scorte non disponibili'], 503);
}
