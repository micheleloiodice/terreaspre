# TERRE ASPRE — sito (prototipo)

Prototipo statico del canale diretto, scritto sulla Brand Platform v1.0 (agosto 2026) e sull'analisi e-commerce.
Il sito sta nella cartella `sito/`, che è quella da caricare su Aruba. Per vederlo in locale (senza pagamenti né moduli):

```
py -m http.server 8090 --directory sito
```

## Pagine

| File | Contenuto |
|---|---|
| `index.html` | Home: «Se pizzica, è vivo», promessa, primo assaggio in tre tempi, vincolo di resa, gamma con il box al centro, pugliese emigrato, spedizione, mandorle |
| `precoce.html` | Linea Precoce: 250 ml, 500 ml, box 3 × 500 ml (`#250`, `#500`, `#box` preselezionano il formato) |
| `quotidiano.html` | Linea Quotidiano 3 L bag-in-box |
| `perche.html` | Perché pizzica: le quattro prove e il confronto con l'extravergine generico |
| `chi-siamo.html` | Il produttore, il luogo come causa agronomica, il nome |
| `professionisti.html` | 5 L HORECA: nessun prezzo pubblico, modulo di richiesta listino (fuori dal menu, solo nel footer, `noindex`) |
| `aiuto.html` | Spedizioni, pagamenti, conservazione, FAQ, note legali |
| `carrello.html` | Carrello con soglia di spedizione gratuita a 35 € e proposta del box sotto soglia; il pulsante apre Stripe Checkout |
| `grazie.html` | Conferma d'ordine con le istruzioni per il primo assaggio |
| `mandorle.html` | Mandorle in guscio 250 g (4,50 €) e combo Precoce 500 ml + mandorle (18 €), etichetta «In esaurimento» |
| `prossimamente.html` | Dalle stesse terre: mandorle già disponibili, cereali in arrivo con modulo «avvisami» |

**Prezzi:** tutti IVA inclusa, con l'etichetta accanto a ogni prezzo e il prezzo al litro o al chilo.

**Combo:** non ha scorte proprie. Ogni combo venduta toglie una bottiglia da 500 ml e un sacchetto di mandorle (`COMPONENTI` in `sito/api/_lib.php` e `componenti` in `PRODUCTS`). Finite le mandorle, la combo risulta esaurita da sola.

**Foto:** si salvano in `sito/assets/foto/` con i nomi della scaletta in [`FOTO.md`](FOTO.md). Finché un file manca, al suo posto compare il riquadro con le istruzioni di ripresa.

**Moduli:** «avvisami» per i cereali e richiesta listino professionisti vanno a `sito/api/modulo.php`. Ogni richiesta viene salvata sul server in `api/dati/moduli-<nome>.csv` (scaricabile via FTP, si apre con Excel) e, se in `config.php` hai indicato le email, arriva anche per posta. In anteprima locale non inviano.

**Carattere:** Caviar Dreams di Lauren Thompson (nymfont.com), scaricato da dafont.com: «Free for personal use & commercial use». I quattro file (normale, corsivo, grassetto, grassetto corsivo) sono in `sito/assets/fonts/` e vengono serviti dal sito stesso, senza Google Fonts.

**Versione dei file:** quando modifichi `style.css` o `app.js`, aumenta il numero `?v=` nei link di tutte le pagine, così i browser non usano la copia vecchia.

Tutti i dati modificabili stanno in cima a `sito/assets/app.js`: `SITE` (comune, contatti, soglia, costo spedizione) e `PRODUCTS`. Con `prototipo: false` spariscono la barra gialla e l'evidenziazione dei segnaposto.

## Regole della piattaforma applicate

- Ogni pagina che precede un assaggio contiene l'avvertimento sensoriale (cap. 9, regola 6 del cap. 13).
- Prezzi del listino approvato, nessuno sconto sul vetro. Abbonamento sul 3 L sospeso: volumi al dettaglio limitati (circa 4 quintali).
- Il 5 L non è nella vetrina consumer.
- Nessun claim salutistico: non ci sono analisi per lotto, quindi il claim del Reg. (UE) 432/2012 non è utilizzabile.
- Nessuna garanzia di rimborso e nessun riferimento ai lotti (tolti su richiesta).
- Riciclabilità e conferimento solo nelle pagine prodotto, senza affermazioni ambientali vaghe.
- Nessuna foto di archivio: illustrazioni SVG delle confezioni e segnaposto con le istruzioni di ripresa (volto del produttore, colatura, frangitura).
- Il testo è stato controllato contro l'elenco delle parole vietate del cap. 9: nessuna occorrenza.
- Il prezzo al litro è indicato in piccolo, perché la normativa sui prezzi lo richiede.

## Da sostituire prima della pubblicazione

1. Comune di molitura, nome del produttore, ragione sociale, P.IVA, email e telefono (`SITE`).
2. Dati dell'oliveto e del frantoio in `chi-siamo.html`: suolo, ettari, piante, ore fra raccolta e molitura.
3. Costo di spedizione sotto soglia (ora 6,90 €), corriere, tempi di consegna, supplementi per le isole.
4. Condizioni di vendita, privacy e cookie policy.
5. Foto e video reali al posto dei segnaposto.
6. Verifica del dominio e del marchio in classe 29.

## Pagamenti: Stripe Checkout

Il carrello manda a `/api/checkout.php` solo codici prodotto e quantità. Lo script ricalcola i prezzi dal proprio catalogo (`CATALOGO` in `sito/api/_lib.php`), controlla le scorte, crea la sessione di pagamento e reindirizza il cliente alla pagina sicura di Stripe. Al termine il cliente torna su `grazie.html`, dove il carrello si svuota.

- **Ordine normale:** modalità `payment`. Spedizione 6,90 € sotto i 35 €, gratuita sopra.
- **Dati raccolti da Stripe:** indirizzo di spedizione (solo Italia), telefono per il corriere, email per la ricevuta.
- Gli script PHP chiamano direttamente l'API di Stripe con cURL, senza librerie da installare.
- La sessione di pagamento scade dopo 30 minuti, così le scorte controllate al momento del clic restano attendibili.

**Se cambi un prezzo**, va cambiato in due posti: `PRODUCTS` in `sito/assets/app.js` (quello che vede il cliente) e `CATALOGO` in `sito/api/_lib.php` (quello che viene addebitato). Vale lo stesso per soglia e costo di spedizione.

### Cartella `sito/api/`

| File | Cosa fa |
|---|---|
| `checkout.php` | Crea il pagamento Stripe |
| `stripe-webhook.php` | Riceve da Stripe la conferma di pagamento e scala le scorte |
| `scorte.php` | Restituisce le scorte attuali al sito |
| `modulo.php` | Riceve i moduli cereali e professionisti |
| `_lib.php` | Funzioni comuni, catalogo e prezzi (non raggiungibile dal web) |
| `config.esempio.php` | Modello delle impostazioni private |
| `config.php` | Chiavi Stripe ed email. **Si crea solo sul server**, non è nel repository |
| `dati/` | Scorte vive, pagamenti registrati, richieste dai moduli. Chiusa al web dal suo `.htaccess` |

## Messa online su Aruba (hosting Linux)

1. **PHP.** Nel pannello Aruba (*Hosting Linux → Pannello di controllo → Versione PHP*) scegli PHP 8.x. Servono le estensioni cURL e mbstring, attive di serie.
2. **SSL.** Attiva il certificato SSL del dominio (Stripe richiede HTTPS). Poi togli il `#` dalle tre righe in fondo a `sito/.htaccess` per mandare tutti su https.
3. **Caricamento.** Due modi:
   - **FTP a mano:** con FileZilla carica il *contenuto* della cartella `sito/` nella cartella del sito su Aruba (credenziali FTP nel pannello Aruba).
   - **Da GitHub:** in *Settings → Secrets and variables → Actions* del repository aggiungi i segreti `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`. Se il sito non sta nella radice dell'FTP, aggiungi la variabile `FTP_DIR` con la cartella giusta e la barra finale. Poi *Actions → Pubblica su Aruba → Run workflow*. Parte solo quando lo lanci tu.
4. **Impostazioni private.** Via FTP, nella cartella `api/` del server, copia `config.esempio.php` come `config.php` e compila: chiave Stripe **di test** (`sk_test_…`), indirizzo del sito, email per gli avvisi e casella mittente del dominio (es. `sito@tuodominio.it`, da creare nel pannello Aruba). Le chiavi stanno solo lì: mai nel repository, mai in chat.
5. **Webhook Stripe.** In Stripe (modalità test): *Sviluppatori → Webhook → Aggiungi endpoint*, URL `https://<tuo-dominio>/api/stripe-webhook.php`, eventi `checkout.session.completed` e `checkout.session.async_payment_succeeded`. Copia il segreto di firma (`whsec_…`) in `config.php`. Va rifatto in modalità live, perché il segreto è diverso.
6. **Prova.** Apri `https://<tuo-dominio>/api/scorte.php`: deve mostrare i numeri delle scorte. Poi fai un ordine con la carta di test `4242 4242 4242 4242` (scadenza futura, CVC qualsiasi), uno sotto 35 € e uno sopra. Controlla il pagamento nella dashboard Stripe, il webhook consegnato e le scorte scalate. Prova anche i due moduli.
7. **Controllo di sicurezza.** `https://<tuo-dominio>/api/config.php` e `https://<tuo-dominio>/api/dati/scorte-vive.json` devono rispondere «Forbidden».
8. **Produzione.** In `config.php` metti la chiave live (`sk_live_…`) e il segreto del webhook live, poi `prototipo: false` in `sito/assets/app.js`.

**Costi:** l'hosting Aruba che hai già. Stripe 1,5% + 0,25 € per carta europea standard, nessun canone.

## Ancora da fare

- **Ordini:** arrivano nella dashboard di Stripe con indirizzo, telefono e contenuto del carrello (campo `carrello` nei metadati). Le etichette di spedizione si fanno a mano sul portale del corriere. Con il crescere degli ordini si può aggiungere un webhook che avvisa per email o crea la spedizione.
- **Condizioni di vendita:** servono anche per il diritto di recesso. Il link si può far comparire nel checkout di Stripe dalle impostazioni di Checkout.

## Scorte: esaurito e ultimi pezzi

I pezzi disponibili stanno in [`sito/scorte.json`](sito/scorte.json), uno per formato. I valori attuali sono di esempio, su circa 430 litri.

- **0** → il formato diventa «Esaurito»: nella home la scheda è grigia, nella pagina prodotto non si può scegliere, nel carrello blocca il pagamento finché non viene tolto.
- **Da 1 a `sogliaPochi`** (ora 10) → compare l'etichetta «Ultime 7 bottiglie», «Ultimi 4 box», «Ultima sacca».
- La quantità acquistabile non supera mai i pezzi rimasti.
- Anche `checkout.php` controlla le scorte e rifiuta gli ordini oltre la disponibilità: non si scavalca modificando il browser.

**Si scalano da sole.** A ogni pagamento riuscito Stripe avvisa `/api/stripe-webhook.php`, che toglie i pezzi venduti dalle scorte vive (`api/dati/scorte-vive.json` sul server). Il sito le legge da `/api/scorte.php`. Se Stripe manda due volte lo stesso avviso, i pezzi vengono tolti una volta sola.

**Rifornimenti e correzioni:** scrivi in `sito/scorte.json` i numeri giusti di oggi, **aumenta `versione` di 1** (da 1 a 2, poi 3…) e caricalo sul server. Al primo accesso le scorte vive prendono i nuovi numeri. Se non aumenti la versione, il file viene ignorato e restano i numeri scalati dalle vendite. Per vedere le scorte attuali apri `https://<tuo-dominio>/api/scorte.php`.

**Ultimo pezzo comprato da due clienti insieme:** può succedere solo se pagano entrambi nello stesso intervallo di 30 minuti. Le scorte si fermano a 0 il numero della sessione viene scritto in `api/dati/sovravendite.log` e, se configurata, ti arriva un'email: quell'ordine va rimborsato da Stripe o evaso con un altro formato.
