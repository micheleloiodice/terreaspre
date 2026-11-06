// TERRE ASPRE — scorte condivise fra le funzioni (checkout, webhook Stripe, lettura pubblica).
// L'archivio vivo sta in Netlify Blobs. sito/scorte.json è la base: se il suo campo "versione" è più alto
// di quello in archivio, il file vince e sovrascrive i numeri (serve per rifornimenti e correzioni a mano).

import BASE from "../../sito/scorte.json";

const CHIAVE = "prodotti";

// Prodotti senza scorte proprie: ogni pezzo venduto consuma questi pezzi di base.
// Tenere allineato con "componenti" in PRODUCTS (sito/assets/app.js).
export const COMPONENTI = {
  "combo-mandorle": { "precoce-500": 1, "mandorle-250": 1 }
};

// { "combo-mandorle": 2, "precoce-500": 1 } → { "precoce-500": 3, "mandorle-250": 2 }
export function espandi(righe) {
  const out = {};
  for (const [id, qty] of Object.entries(righe)) {
    for (const [base, q] of Object.entries(COMPONENTI[id] || { [id]: 1 })) out[base] = (out[base] || 0) + q * qty;
  }
  return out;
}

export async function apriStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "scorte", consistency: "strong" });
}

// sito/scorte.json incluso nella funzione al momento della pubblicazione (esbuild, vedi netlify.toml):
// non dipende dal sito raggiungibile via rete, che può essere protetto da password.
export const leggiFileBase = async () => BASE;

const daFile = f => ({
  versione: Number(f.versione) || 0,
  prodotti: Object.fromEntries(Object.entries(f.prodotti || {}).map(([k, v]) => [k, Math.max(0, Math.floor(Number(v) || 0))])),
  aggiornato: new Date().toISOString()
});

// Restituisce { data, etag } allineato con il file. sogliaPochi viene sempre dal file.
async function stato(store, leggiFile) {
  const file = await leggiFile();
  let cur = await store.getWithMetadata(CHIAVE, { type: "json" });
  if (!cur?.data || (Number(file.versione) || 0) > (Number(cur.data.versione) || 0)) {
    await store.setJSON(CHIAVE, daFile(file));
    cur = await store.getWithMetadata(CHIAVE, { type: "json" });
  }
  return { data: cur.data, etag: cur.etag, sogliaPochi: file.sogliaPochi ?? 10 };
}

export async function leggiScorte(store, leggiFile) {
  const { data, sogliaPochi } = await stato(store, leggiFile);
  return { sogliaPochi, prodotti: data.prodotti, aggiornato: data.aggiornato };
}

// "2x precoce-500, 1x precoce-box" (metadata della sessione Checkout) → { "precoce-500": 2, "precoce-box": 1 }
export function leggiCarrello(testo) {
  const out = {};
  for (const parte of String(testo || "").split(",")) {
    const m = parte.trim().match(/^(\d+)x\s+([a-z0-9-]+)$/);
    if (m) out[m[2]] = (out[m[2]] || 0) + Number(m[1]);
  }
  return out;
}

// Scala i pezzi venduti in una sessione pagata. Idempotente: Stripe può mandare lo stesso evento più volte.
// Restituisce i formati andati sotto zero (venduti oltre la disponibilità), da rimborsare a mano.
export async function scalaScorte(store, leggiFile, sessionId, righe) {
  const giaFatto = await store.get(`sessioni/${sessionId}`);
  if (giaFatto) return { duplicato: true, sovravenduti: [] };

  for (let tentativo = 0; tentativo < 6; tentativo++) {
    const { data, etag } = await stato(store, leggiFile);
    const prodotti = { ...data.prodotti };
    const sovravenduti = [];
    for (const [id, qty] of Object.entries(espandi(righe))) {
      const resta = (prodotti[id] ?? 0) - qty;
      if (resta < 0) sovravenduti.push({ id, mancano: -resta });
      prodotti[id] = Math.max(0, resta);
    }
    const nuovo = { ...data, prodotti, aggiornato: new Date().toISOString() };
    // scrive solo se nessun altro ha modificato le scorte nel frattempo, altrimenti riprova
    const esito = await store.setJSON(CHIAVE, nuovo, etag ? { onlyIfMatch: etag } : {});
    if (esito?.modified === false) continue;
    await store.set(`sessioni/${sessionId}`, new Date().toISOString());
    return { duplicato: false, sovravenduti };
  }
  throw new Error("Scorte occupate: troppi aggiornamenti concorrenti");
}

// Verifica la firma Stripe (header Stripe-Signature: t=...,v1=...) con HMAC-SHA256, senza librerie.
export async function verificaFirma(corpo, header, segreto, tolleranzaSec = 300, adesso = Date.now()) {
  if (!header || !segreto) return false;
  const coppie = header.split(",").map(p => p.trim().split("="));
  const t = coppie.find(([k]) => k === "t")?.[1];
  const firme = coppie.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !firme.length) return false;
  if (Math.abs(adesso / 1000 - Number(t)) > tolleranzaSec) return false;
  const chiave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", chiave, new TextEncoder().encode(`${t}.${corpo}`));
  const atteso = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("");
  return firme.some(f => f.length === atteso.length && [...f].reduce((d, c, i) => d | (c.charCodeAt(0) ^ atteso.charCodeAt(i)), 0) === 0);
}
