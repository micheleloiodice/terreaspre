// TERRE ASPRE — scorte attuali per il sito (GET /api/scorte). Solo lettura.

import { apriStore, leggiFileBase, leggiScorte } from "../lib/scorte.mjs";

export default async (req) => {
  try {
    const scorte = await leggiScorte(await apriStore(), leggiFileBase);
    return new Response(JSON.stringify(scorte), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (e) {
    console.error("Scorte:", e.message);
    return new Response(JSON.stringify({ errore: "Scorte non disponibili" }), { status: 503, headers: { "content-type": "application/json" } });
  }
};

export const config = { path: "/api/scorte" };
