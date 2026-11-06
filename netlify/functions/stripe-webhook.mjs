// TERRE ASPRE — riceve gli eventi di Stripe e scala le scorte a ogni pagamento riuscito.
// Netlify Function su /api/stripe-webhook. Variabile d'ambiente: STRIPE_WEBHOOK_SECRET (whsec_...).

import { apriStore, leggiFileBase, leggiCarrello, scalaScorte, verificaFirma } from "../lib/scorte.mjs";

const EVENTI_PAGATI = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];

// Separata dall'handler per poterla provare con un archivio finto.
export async function gestisciEvento(evento, store, leggiFile) {
  if (!EVENTI_PAGATI.includes(evento?.type)) return { ignorato: true };
  const sessione = evento.data?.object;
  if (sessione?.payment_status !== "paid") return { ignorato: true };
  const righe = leggiCarrello(sessione.metadata?.carrello);
  const esito = await scalaScorte(store, leggiFile, sessione.id, righe);
  if (esito.sovravenduti.length) {
    // Due clienti hanno comprato gli ultimi pezzi insieme: l'ordine va gestito o rimborsato a mano.
    console.warn("SOVRAVENDITA", sessione.id, JSON.stringify(esito.sovravenduti));
  }
  return esito;
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Metodo non consentito", { status: 405 });
  const segreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!segreto) return new Response("Webhook non configurato", { status: 500 });

  const corpo = await req.text();
  if (!(await verificaFirma(corpo, req.headers.get("stripe-signature"), segreto))) {
    return new Response("Firma non valida", { status: 400 });
  }

  try {
    await gestisciEvento(JSON.parse(corpo), await apriStore(), leggiFileBase);
  } catch (e) {
    console.error("Webhook:", e.message);
    return new Response("Errore", { status: 500 }); // Stripe riprova da solo
  }
  return new Response("ok");
};

export const config = { path: "/api/stripe-webhook" };
