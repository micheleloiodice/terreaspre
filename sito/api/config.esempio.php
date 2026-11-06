<?php
// TERRE ASPRE — impostazioni private del server.
// Copia questo file come config.php nella stessa cartella e compila i valori DIRETTAMENTE sul server (via FTP).
// config.php non va mai su GitHub: è escluso dal .gitignore.

return [
  // Chiave segreta Stripe: sk_test_... per le prove, sk_live_... quando il sito è online davvero.
  'stripe_secret_key' => '',
  // Segreto di firma del webhook Stripe (whsec_...). È diverso fra modalità test e live.
  'stripe_webhook_secret' => '',
  // Indirizzo del sito senza barra finale, es. https://www.terreaspre.it. Vuoto = ricavato dalla richiesta.
  'url_sito' => '',
  // Dove ricevere le richieste dai moduli e gli avvisi di ordini oltre la disponibilità.
  'email_notifiche' => '',
  // Mittente delle email: deve essere una casella del tuo dominio Aruba, es. sito@terreaspre.it.
  'email_mittente' => '',
];
