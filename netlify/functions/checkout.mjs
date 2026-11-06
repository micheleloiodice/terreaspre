// TERRE ASPRE — crea una sessione Stripe Checkout a partire dal carrello.
// Gira come Netlify Function su /api/checkout. Usa l'API REST di Stripe e le scorte vive in Netlify Blobs.
// Variabile d'ambiente richiesta: STRIPE_SECRET_KEY (sk_test_... in prova, sk_live_... in produzione).

import { apriStore, leggiFileBase, leggiScorte, espandi } from "../lib/scorte.mjs";

const DURATA_SESSIONE_SEC = 30 * 60; // il minimo di Stripe: limita il tempo fra controllo scorte e pagamento

// I prezzi validi sono solo questi: il browser manda codici e quantità, mai importi.
// Tenere allineato con PRODUCTS e SITE in sito/assets/app.js.
export const CATALOGO = {
  "precoce-250": { nome: "TERRE ASPRE Precoce 250 ml", descrizione: "Coratina 100%, raccolta precoce, vetro scuro", cent: 900 },
  "precoce-500": { nome: "TERRE ASPRE Precoce 500 ml", descrizione: "Coratina 100%, raccolta precoce, vetro scuro", cent: 1400 },
  "precoce-box": { nome: "TERRE ASPRE Box 3 × 500 ml", descrizione: "Tre bottiglie da 500 ml", cent: 3600 },
  "quotidiano-3l": { nome: "TERRE ASPRE Quotidiano 3 L", descrizione: "Coratina 100%, bag-in-box", cent: 5100 },
  "mandorle-250": { nome: "TERRE ASPRE Mandorle in guscio 250 g", descrizione: "Mandorle in guscio", cent: 450 },
  "combo-mandorle": { nome: "TERRE ASPRE Combo olio + mandorle", descrizione: "Precoce 500 ml + mandorle in guscio 250 g", cent: 1800 }
};
export const SOGLIA_GRATUITA_CENT = 3500;
export const SPEDIZIONE_CENT = 690;
const MAX_QTY = 24;

export class ErroreCarrello extends Error {}

// Normalizza e controlla il carrello ricevuto dal browser.
export function validaCarrello(items) {
  if (!Array.isArray(items) || items.length === 0) throw new ErroreCarrello("Il carrello è vuoto.");
  if (items.length > 20) throw new ErroreCarrello("Troppe righe nel carrello.");
  return items.map(i => {
    const p = CATALOGO[i?.id];
    const qty = Number(i?.qty);
    if (!p) throw new ErroreCarrello("Prodotto non riconosciuto.");
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw new ErroreCarrello("Quantità non valida.");
    return { id: i.id, qty };
  });
}

// Costruisce i parametri della sessione Checkout (oggetto annidato, poi codificato in form).
export function parametriSessione(items, origin) {
  const righe = validaCarrello(items);
  const subtotale = righe.reduce((s, r) => s + CATALOGO[r.id].cent * r.qty, 0);

  const params = {
    mode: "payment",
    locale: "it",
    expires_at: Math.floor(Date.now() / 1000) + DURATA_SESSIONE_SEC,
    success_url: `${origin}/grazie.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/carrello.html`,
    shipping_address_collection: { allowed_countries: ["IT"] },
    phone_number_collection: { enabled: true },
    billing_address_collection: "auto",
    line_items: righe.map(r => {
      const p = CATALOGO[r.id];
      return {
        price_data: { currency: "eur", unit_amount: p.cent, product_data: { name: p.nome, description: p.descrizione } },
        quantity: r.qty
      };
    }),
    metadata: { carrello: righe.map(r => `${r.qty}x ${r.id}`).join(", ").slice(0, 500) }
  };

  const gratis = subtotale >= SOGLIA_GRATUITA_CENT;
  params.shipping_options = [{
    shipping_rate_data: {
      type: "fixed_amount",
      display_name: gratis ? "Spedizione gratuita" : "Spedizione",
      fixed_amount: { amount: gratis ? 0 : SPEDIZIONE_CENT, currency: "eur" }
    }
  }];

  return params;
}

// Codifica un oggetto annidato nel formato form di Stripe: a[b][0][c]=valore
export function codificaForm(obj, prefisso = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const chiave = prefisso ? `${prefisso}[${k}]` : k;
    if (v === null || v === undefined) continue;
    if (typeof v === "object") codificaForm(v, chiave, out);
    else out.append(chiave, String(v));
  }
  return out;
}

// Confronta il carrello con /scorte.json (pezzi disponibili per formato). Lancia ErroreCarrello se manca qualcosa.
export function verificaScorte(items, scorte) {
  const disp = scorte?.prodotti;
  if (!disp) throw new Error("scorte.json non valido");
  const richiesti = {};
  for (const r of validaCarrello(items)) richiesti[r.id] = (richiesti[r.id] || 0) + r.qty;
  // la combo consuma pezzi di olio e di mandorle: si controlla sui pezzi di base
  for (const [id, qty] of Object.entries(espandi(richiesti))) {
    const n = Math.max(0, Number(disp[id]) || 0);
    if (n === 0) throw new ErroreCarrello(`${CATALOGO[id].nome} è esaurito. Rimuovilo dal carrello per procedere.`);
    if (qty > n) throw new ErroreCarrello(`Di ${CATALOGO[id].nome} restano solo ${n} pezzi, contando anche le combo nel carrello.`);
  }
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ errore: "Metodo non consentito." }, 405);

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json({ errore: "Pagamento non configurato." }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ errore: "Richiesta non valida." }, 400); }

  const origin = process.env.URL || new URL(req.url).origin;

  let scorte;
  try {
    scorte = await leggiScorte(await apriStore(), leggiFileBase);
  } catch (e) {
    console.error("Scorte non leggibili:", e.message);
    return json({ errore: "Non riusciamo a verificare la disponibilità. Riprova tra poco." }, 503);
  }

  let params;
  try {
    verificaScorte(body?.items, scorte);
    params = parametriSessione(body?.items, origin);
  } catch (e) {
    if (e instanceof ErroreCarrello) return json({ errore: e.message }, e.message.includes("esaurito") || e.message.includes("restano") ? 409 : 400);
    console.error("Scorte:", e.message);
    return json({ errore: "Non riusciamo a verificare la disponibilità. Riprova tra poco." }, 503);
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
    body: codificaForm(params)
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Stripe:", data?.error?.message);
    return json({ errore: "Il pagamento non è disponibile in questo momento. Riprova tra poco." }, 502);
  }
  return json({ url: data.url });
};

export const config = { path: "/api/checkout" };
