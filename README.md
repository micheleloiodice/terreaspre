# TERRE ASPRE — sito (prototipo)

Prototipo statico del canale diretto, scritto sulla Brand Platform v1.0 (agosto 2026) e sull'analisi e-commerce.
Il sito sta nella cartella `sito/`, pubblicata da Netlify. Per vederlo in locale (senza pagamenti né moduli):

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
| `aiuto.html` | Spedizioni, pagamenti, conservazione, FAQ, dati del venditore |
| `note-legali.html` | Bozza di condizioni di vendita (con recesso), privacy e cookie |
| `carrello.html` | Carrello con soglia di spedizione gratuita a 35 € e proposta del box sotto soglia; il pulsante apre Stripe Checkout |
| `grazie.html` | Conferma d'ordine con le istruzioni per il primo assaggio |
| `mandorle.html` | Mandorle in guscio 250 g (4,50 €) e combo Precoce 500 ml + mandorle (18 €), etichetta «In esaurimento» |
| `prossimamente.html` | Dalle stesse terre: mandorle già disponibili, cereali in arrivo con modulo «avvisami» |

**Prezzi:** tutti IVA inclusa, con l'etichetta accanto a ogni prezzo e il prezzo al litro o al chilo.

**Combo:** non ha scorte proprie. Ogni combo venduta toglie una bottiglia da 500 ml e un sacchetto di mandorle (`COMPONENTI` in `netlify/lib/scorte.mjs` e `componenti` in `PRODUCTS`). Finite le mandorle, la combo risulta esaurita da sola.

**Foto:** si salvano in `sito/assets/foto/` con i nomi della scaletta in [`FOTO.md`](FOTO.md). Finché un file manca, al suo posto compare il riquadro con le istruzioni di ripresa.

**Moduli:** «avvisami» per i cereali e richiesta listino professionisti sono raccolti da Netlify Forms. Li trovi nel pannello Netlify alla voce *Forms*, dove puoi anche attivare l'avviso via email. In anteprima locale non inviano.

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

1. Sede: completare CAP e comune dopo «C.da San Magno» (`SITE.sede` in app.js).
2. Scorte reali in `sito/scorte.json` (ora numeri di esempio).
3. Corriere e tempi di consegna (spedizione sotto soglia: 20 €, stesso prezzo in tutta Italia).
4. Far verificare a un consulente la bozza di condizioni, privacy e cookie in `note-legali.html`, poi togliere la riga «Bozza» e il `noindex`.
5. Foto e video reali al posto dei segnaposto.
6. Verifica del dominio e del marchio in classe 29.

## Pagamenti: Stripe Checkout

Il carrello manda a `/api/checkout` solo codici prodotto e quantità. La funzione [`netlify/functions/checkout.mjs`](netlify/functions/checkout.mjs) ricalcola i prezzi dal proprio catalogo, controlla le scorte, crea la sessione di pagamento e reindirizza il cliente alla pagina sicura di Stripe. Al termine il cliente torna su `grazie.html`, dove il carrello si svuota.

- **Ordine normale:** modalità `payment`. Spedizione 20 € sotto i 35 €, gratuita sopra (`SITE.costoSpedizione` in app.js e `SPEDIZIONE_CENT` in checkout.mjs).
- **Dati raccolti da Stripe:** indirizzo di spedizione (solo Italia), telefono per il corriere, email per la ricevuta.
- Le funzioni chiamano direttamente l'API di Stripe. L'unica dipendenza è `@netlify/blobs` (archivio delle scorte), che Netlify installa da solo leggendo `package.json`.
- La sessione di pagamento scade dopo 30 minuti, così le scorte controllate al momento del clic restano attendibili.

**Se cambi un prezzo**, va cambiato in due posti: `PRODUCTS` in `sito/assets/app.js` (quello che vede il cliente) e `CATALOGO` in `netlify/functions/checkout.mjs` (quello che viene addebitato). Vale lo stesso per soglia e costo di spedizione.

## Messa online: Netlify, con dominio ed email su Aruba

Netlify pubblica il sito ed esegue le funzioni di pagamento. Aruba resta il registrar del dominio e il fornitore delle caselle email.

1. **Stripe.** Crea l'account su stripe.com con i dati dell'azienda e il conto per gli accrediti. In *Impostazioni → Email ai clienti* attiva le ricevute per i pagamenti riusciti.
2. **Netlify.** Su app.netlify.com accedi con GitHub, poi *Add new site → Import an existing project → GitHub* e scegli `terreaspre`. Le impostazioni le legge da `netlify.toml`. Ottieni un indirizzo `…netlify.app` per le prove.
3. **Chiave di test.** In *Site configuration → Environment variables* aggiungi `STRIPE_SECRET_KEY` con la chiave **di test** (`sk_test_…`).
4. **Webhook Stripe** (scala le scorte a ogni pagamento). In Stripe: *Sviluppatori → Webhook → Aggiungi endpoint*, URL `https://<tuo-sito>/api/stripe-webhook`, eventi `checkout.session.completed` e `checkout.session.async_payment_succeeded`. Copia il *segreto di firma* (`whsec_…`) e aggiungilo su Netlify come variabile `STRIPE_WEBHOOK_SECRET`, poi *Deploys → Trigger deploy*. Va rifatto in modalità live, perché il segreto è diverso.
5. **Prova** sull'indirizzo `…netlify.app`: un ordine con la carta di test `4242 4242 4242 4242` (scadenza futura, CVC qualsiasi), uno sotto 35 € e uno sopra. Controlla il pagamento nella dashboard Stripe in modalità test, il webhook consegnato e `https://<tuo-sito>/api/scorte` con i pezzi scalati. Prova anche i due moduli.
6. **Dominio.** Su Netlify: *Domain management → Add a domain* con il tuo dominio. Netlify indica i record DNS da creare; nel pannello Aruba (*Gestione DNS e name server*) modifica **solo** il record `A` del dominio e il `CNAME` di `www` come indicato. **Non toccare i record `MX`**: sono quelli delle email Aruba. Il certificato HTTPS lo attiva Netlify da solo.
7. **Produzione.** Sostituisci la chiave con quella live (`sk_live_…`) e il segreto del webhook live, metti `prototipo: false` in `sito/assets/app.js`.

La chiave segreta va solo nelle variabili d'ambiente di Netlify, mai in un file del sito o nel repository.

**Costi:** Netlify gratuito per questo traffico. Aruba: dominio ed email. Lo spazio web Aruba non serve più: al rinnovo si può passare al solo dominio con email. Stripe 1,5% + 0,25 € per carta europea standard, nessun canone.

## Ancora da fare

- **Ordini:** arrivano nella dashboard di Stripe con indirizzo, telefono e contenuto del carrello (campo `carrello` nei metadati). Le etichette di spedizione si fanno a mano sul portale del corriere. Con il crescere degli ordini si può aggiungere un webhook che avvisa per email o crea la spedizione.
- **Condizioni di vendita:** servono anche per il diritto di recesso. Il link si può far comparire nel checkout di Stripe dalle impostazioni di Checkout.

## Scorte: esaurito e ultimi pezzi

I pezzi disponibili stanno in [`sito/scorte.json`](sito/scorte.json), uno per formato. I valori attuali sono di esempio, su circa 430 litri.

- **0** → il formato diventa «Esaurito»: nella home la scheda è grigia, nella pagina prodotto non si può scegliere, nel carrello blocca il pagamento finché non viene tolto.
- **Da 1 a `sogliaPochi`** (ora 10) → compare l'etichetta «Ultime 7 bottiglie», «Ultimi 4 box», «Ultima sacca».
- La quantità acquistabile non supera mai i pezzi rimasti.
- Anche la funzione di pagamento controlla le scorte e rifiuta gli ordini oltre la disponibilità: non si scavalca modificando il browser.

**Si scalano da sole.** A ogni pagamento riuscito Stripe avvisa `/api/stripe-webhook`, che toglie i pezzi venduti dall'archivio (Netlify Blobs). Il sito legge le scorte vive da `/api/scorte`. Se Stripe manda due volte lo stesso avviso, i pezzi vengono tolti una volta sola.

**Rifornimenti e correzioni:** scrivi in `sito/scorte.json` i numeri giusti di oggi, **aumenta `versione` di 1** (da 1 a 2, poi 3…) e invia la modifica su GitHub. Al primo accesso l'archivio prende i nuovi numeri. Se non aumenti la versione, il file viene ignorato e restano i numeri scalati dalle vendite. Per vedere le scorte attuali apri `https://<tuo-sito>/api/scorte`.

**Ultimo pezzo comprato da due clienti insieme:** può succedere solo se pagano entrambi nello stesso intervallo di 30 minuti. Le scorte si fermano a 0 nei log della funzione su Netlify compare `SOVRAVENDITA` con il numero della sessione: quell'ordine va rimborsato da Stripe o evaso con un altro formato.
