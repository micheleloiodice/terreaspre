/* TERRE ASPRE — dati del sito, carrello e componenti condivisi.
   Tutti i dati da sostituire (comune, contatti, condizioni) stanno in SITE. */

const SITE = {
  prototipo: true,                       // false = nasconde la barra e l'evidenziazione dei segnaposto
  comune: "[Comune]",
  provincia: "BA",
  produttore: "[Nome e cognome del produttore]",
  azienda: "[Ragione sociale]",
  piva: "[P.IVA]",
  email: "info@terreaspre.com",
  telefono: "[telefono]",
  sogliaSpedizione: 35,                  // spedizione gratuita da questa cifra (Brand Platform, cap. 7)
  costoSpedizione: 6.9                   // da confermare con le tariffe corriere
};

const PRODUCTS = {
  "precoce-250": { nome: "Precoce 250 ml", linea: "Precoce", formato: "250 ml · vetro scuro", prezzo: 9, litri: 0.25, art: "bottle-250", url: "precoce.html" },
  "precoce-500": { nome: "Precoce 500 ml", linea: "Precoce", formato: "500 ml · vetro scuro", prezzo: 14, litri: 0.5, art: "bottle-500", url: "precoce.html" },
  "precoce-box": { nome: "Box 3 × 500 ml", linea: "Precoce", formato: "3 bottiglie da 500 ml", prezzo: 36, litri: 1.5, art: "box-3", url: "precoce.html" },
  "quotidiano-3l": { nome: "Quotidiano 3 L", linea: "Quotidiano", formato: "3 L · bag-in-box", prezzo: 51, litri: 3, art: "bib-3", url: "quotidiano.html" },
  "mandorle-250": { nome: "Mandorle in guscio 250 g", linea: "Mandorle", formato: "250 g · in guscio", prezzo: 4.5, kg: 0.25, art: "mandorle", url: "mandorle.html", inEsaurimento: true },
  // la combo non ha scorte proprie: usa una bottiglia da 500 ml e un sacchetto di mandorle
  "combo-mandorle": { nome: "Combo olio + mandorle", linea: "Combo", formato: "Precoce 500 ml + mandorle in guscio 250 g", prezzo: 18, art: "combo", url: "mandorle.html", inEsaurimento: true,
                      componenti: { "precoce-500": 1, "mandorle-250": 1 } }
};

// Foto del sito. Basta salvare il file in assets/foto/ con il nome indicato: finché manca, al suo posto compare
// il segnaposto con le istruzioni di ripresa. Regole visive dalla Brand Platform, cap. 12. Scaletta completa in FOTO.md.
const FOTO = {
  colatura:   { file: "colatura.jpg",   rapporto: "21/9", alt: "Olio verde appena molito che cola dal separatore",
                brief: "Colatura dal separatore: olio verde e torbido appena molito, ripresa ravvicinata, luce naturale neutra." },
  raccolta:   { file: "raccolta.jpg",   rapporto: "4/5",  alt: "Mani che raccolgono olive ancora verdi dal ramo",
                brief: "Mani che staccano olive ancora verdi dal ramo. Deve vedersi che la raccolta è precoce." },
  frantoio:   { file: "frantoio.jpg",   rapporto: "4/5",  alt: "Pasta di olive nella gramola del frantoio",
                brief: "Frangitura: pasta di olive in gramola o al decanter, attrezzatura vera, nessuna messa in scena." },
  bottiglia:  { file: "bottiglia.jpg",  rapporto: "4/5",  alt: "Bottiglia di vetro scuro in mano, etichetta in primo piano",
                brief: "Bottiglia di vetro scuro in mano, etichetta in primo piano, luce naturale. Niente fondo bianco." },
  produttore: { file: "produttore.jpg", rapporto: "4/5",  alt: "Il produttore in frantoio con l'olio appena molito",
                brief: "Il produttore in campo o in frantoio, sguardo sul prodotto, mani e attrezzatura in vista. Niente pose." },
  suolo:      { file: "suolo.jpg",      rapporto: "16/9", alt: "Suolo calcareo e pietre ai piedi di un olivo",
                brief: "Suolo calcareo con pietre ai piedi di un tronco d'olivo, luce piena di giorno. Niente tramonto." },
  olive:      { file: "olive.jpg",      rapporto: "16/9", alt: "Cassetta di olive verdi appena raccolte",
                brief: "Cassetta di olive appena raccolte, verdi con poche invaiate. Cartellino con la data visibile." },
  crudo:      { file: "crudo.jpg",      rapporto: "4/3",  alt: "Olio versato a crudo su un piatto di legumi",
                brief: "Olio versato a crudo su legumi o verdure, inquadratura stretta sul filo d'olio. Niente tavola imbandita." },
  bib:        { file: "bib.jpg",        rapporto: "4/3",  alt: "Bag-in-box da 3 litri in una cucina di casa",
                brief: "Bag-in-box sul piano di una cucina vera, mano che apre il rubinetto, olio che scende nel cucchiaio." },
  horeca:     { file: "horeca.jpg",     rapporto: "4/3",  alt: "Cuoco che versa olio dal bag-in-box da 5 litri",
                brief: "Cuoco che versa dal 5 L in una cucina professionale in servizio. Volto non obbligatorio, mani sì." },
  mandorle:   { file: "mandorle.jpg",   rapporto: "4/3",  alt: "Mandorle in guscio appena raccolte",
                brief: "Mandorle in guscio su telo o in cassetta dopo la raccolta, mani che le smuovono." },
  grano:      { file: "grano.jpg",      rapporto: "4/3",  alt: "Spighe di grano duro su terreno calcareo",
                brief: "Spighe di grano duro mature, inquadratura stretta, suolo sassoso visibile alla base." }
};

/* ---------- Formattazione ---------- */
const euro = n => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
// prezzo per unità di misura, obbligatorio per legge sui prodotti sfusi a peso o volume
const perLitro = p => p.litri ? euro(p.prezzo / p.litri) + "/L" : p.kg ? euro(p.prezzo / p.kg) + "/kg" : "";
const unitaPrezzo = p => ["IVA inclusa", perLitro(p)].filter(Boolean).join(" · ");
const data = iso => new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso + "T12:00:00"));
const dataBreve = iso => new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long" }).format(new Date(iso + "T12:00:00"));

/* ---------- Memoria carrello (localStorage con ripiego in memoria) ---------- */
const store = (() => {
  let mem = {};
  return {
    get(k) {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }
      catch { return mem[k] ?? null; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); }
      catch { mem[k] = v; }
    }
  };
})();

const Cart = {
  items() {
    const merged = [];
    for (const i of store.get("ta-cart") || []) {
      if (!PRODUCTS[i.id]) continue;
      const m = merged.find(x => x.id === i.id);
      if (m) m.qty = Math.min(m.qty + i.qty, 24);
      else merged.push({ key: i.id, id: i.id, qty: i.qty });
    }
    return merged;
  },
  save(items) { store.set("ta-cart", items); updateCartCount(); },
  add(id, qty = 1) {
    const items = this.items();
    const found = items.find(i => i.key === id);
    if (found) found.qty = Math.min(found.qty + qty, 24);
    else items.push({ key: id, id, qty });
    this.save(items);
  },
  setQty(key, qty) {
    let items = this.items();
    items = qty <= 0 ? items.filter(i => i.key !== key) : items.map(i => i.key === key ? { ...i, qty: Math.min(qty, 24) } : i);
    this.save(items);
  },
  count() { return this.items().reduce((s, i) => s + i.qty, 0); },
  subtotal() { return this.items().reduce((s, i) => s + PRODUCTS[i.id].prezzo * i.qty, 0); }
};

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach(el => { el.textContent = Cart.count(); });
}

/* ---------- Illustrazioni prodotto (SVG, nessuna foto di archivio) ---------- */
function bottle(x, y, h, label) {
  const w = h * 0.32, neck = w * 0.34, shoulder = h * 0.3;
  const cx = x + w / 2;
  return `
  <g>
    <rect x="${cx - neck / 2 - 2}" y="${y}" width="${neck + 4}" height="${h * 0.07}" rx="2" fill="#0d100c"/>
    <path d="M${cx - neck / 2} ${y + h * 0.07} V${y + shoulder * 0.55}
      C${cx - neck / 2} ${y + shoulder * 0.8} ${x} ${y + shoulder * 0.85} ${x} ${y + shoulder + 6}
      V${y + h - 6} Q${x} ${y + h} ${x + 6} ${y + h} H${x + w - 6} Q${x + w} ${y + h} ${x + w} ${y + h - 6}
      V${y + shoulder + 6} C${x + w} ${y + shoulder * 0.85} ${cx + neck / 2} ${y + shoulder * 0.8} ${cx + neck / 2} ${y + shoulder * 0.55}
      V${y + h * 0.07} Z" fill="#2a3123"/>
    <path d="M${x + w * 0.14} ${y + shoulder + 14} V${y + h - 16}" stroke="rgba(255,255,255,.12)" stroke-width="${w * 0.06}" stroke-linecap="round"/>
    <rect x="${x + w * 0.1}" y="${y + h * 0.44}" width="${w * 0.8}" height="${h * 0.36}" fill="#eeece6"/>
    <text x="${cx}" y="${y + h * 0.52}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.13}" letter-spacing="${w * 0.03}" fill="#161b14">TERRE</text>
    <text x="${cx}" y="${y + h * 0.575}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.13}" letter-spacing="${w * 0.03}" fill="#161b14">ASPRE</text>
    <line x1="${x + w * 0.25}" x2="${x + w * 0.75}" y1="${y + h * 0.605}" y2="${y + h * 0.605}" stroke="#88745b" stroke-width="1"/>
    <text x="${cx}" y="${y + h * 0.645}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.075}" letter-spacing="${w * 0.02}" fill="#88745b">${label}</text>
    <text x="${cx}" y="${y + h * 0.71}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.07}" fill="#5b5d52">CORATINA 100%</text>
  </g>`;
}

// sacchetto di carta kraft con finestra sulle mandorle
function sacchetto(x, y, w, h) {
  const cx = x + w / 2;
  const mandorla = (mx, my, r) => `<ellipse cx="${mx}" cy="${my}" rx="${w * 0.07}" ry="${w * 0.045}" transform="rotate(${r} ${mx} ${my})" fill="#a27a4c" stroke="#7d5a33" stroke-width="1"/>`;
  return `
  <g>
    <path d="M${x} ${y + h * 0.06} L${x + w * 0.08} ${y} H${x + w * 0.92} L${x + w} ${y + h * 0.06} V${y + h} H${x} Z" fill="#c6a679"/>
    <path d="M${x} ${y + h * 0.06} H${x + w}" stroke="#a88a5e" stroke-width="2"/>
    <path d="M${x + w * 0.08} ${y} L${x + w * 0.04} ${y + h * 0.06}" stroke="#a88a5e"/>
    <rect x="${x + w * 0.14}" y="${y + h * 0.14}" width="${w * 0.72}" height="${h * 0.3}" fill="#eeece6"/>
    <text x="${cx}" y="${y + h * 0.22}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.1}" letter-spacing="${w * 0.02}" fill="#161b14">TERRE</text>
    <text x="${cx}" y="${y + h * 0.29}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.1}" letter-spacing="${w * 0.02}" fill="#161b14">ASPRE</text>
    <line x1="${x + w * 0.3}" x2="${x + w * 0.7}" y1="${y + h * 0.32}" y2="${y + h * 0.32}" stroke="#88745b"/>
    <text x="${cx}" y="${y + h * 0.365}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.065}" letter-spacing="${w * 0.01}" fill="#88745b">MANDORLE IN GUSCIO</text>
    <text x="${cx}" y="${y + h * 0.415}" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="${w * 0.06}" fill="#5b5d52">250 g</text>
    <rect x="${x + w * 0.2}" y="${y + h * 0.52}" width="${w * 0.6}" height="${h * 0.38}" rx="4" fill="#efe6d6" stroke="#a88a5e"/>
    ${mandorla(cx - w * 0.15, y + h * 0.62, -20)}${mandorla(cx + w * 0.05, y + h * 0.6, 25)}${mandorla(cx - w * 0.05, y + h * 0.72, 10)}
    ${mandorla(cx + w * 0.16, y + h * 0.74, -35)}${mandorla(cx - w * 0.17, y + h * 0.82, 40)}${mandorla(cx + w * 0.03, y + h * 0.84, -10)}
  </g>`;
}

function art(type) {
  switch (type) {
    case "bottle-250":
      return `<svg viewBox="0 0 160 400" role="img" aria-label="Bottiglia da 250 ml">${bottle(42, 120, 270, "PRECOCE")}</svg>`;
    case "bottle-500":
      return `<svg viewBox="0 0 160 400" role="img" aria-label="Bottiglia da 500 ml">${bottle(30, 20, 370, "PRECOCE")}</svg>`;
    case "box-3": {
      return `<svg viewBox="0 0 360 400" role="img" aria-label="Box da tre bottiglie da 500 ml">
        ${bottle(42, 40, 300, "PRECOCE")}${bottle(132, 40, 300, "PRECOCE")}${bottle(222, 40, 300, "PRECOCE")}
        <rect x="20" y="250" width="320" height="140" fill="#59634b"/>
        <rect x="20" y="250" width="320" height="6" fill="#0d100c"/>
        <text x="180" y="312" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="22" letter-spacing="7" fill="#eeece6">TERRE ASPRE</text>
        <text x="180" y="340" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="10" letter-spacing="3" fill="#d8c6a5">TRE BOTTIGLIE · 500 ML</text>
        <text x="180" y="365" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="10" letter-spacing="1.5" fill="#c3c5b6">3 × 500 ml · Coratina 100%</text>
      </svg>`;
    }
    case "bib-3":
      return `<svg viewBox="0 0 300 400" role="img" aria-label="Bag-in-box da 3 litri">
        <path d="M40 70 L150 40 L260 70 L260 360 L40 360 Z" fill="#c9ad7c"/>
        <path d="M40 70 L150 40 L260 70 L150 98 Z" fill="#d8bf92"/>
        <rect x="40" y="70" width="220" height="290" fill="#b8996a"/>
        <rect x="118" y="82" width="64" height="14" rx="7" fill="#8f7550"/>
        <rect x="60" y="120" width="180" height="150" fill="#eeece6"/>
        <text x="150" y="160" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="20" letter-spacing="6" fill="#161b14">TERRE</text>
        <text x="150" y="186" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="20" letter-spacing="6" fill="#161b14">ASPRE</text>
        <line x1="100" x2="200" y1="200" y2="200" stroke="#7a5c2c"/>
        <text x="150" y="222" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="12" letter-spacing="3" fill="#7a5c2c">QUOTIDIANO</text>
        <text x="150" y="244" text-anchor="middle" font-family="Caviar Dreams, sans-serif" font-weight="700" font-size="8" letter-spacing="0" fill="#5b5d52">3 L · CORATINA 100%</text>
        <rect x="128" y="300" width="44" height="22" rx="3" fill="#59634b"/>
        <rect x="140" y="322" width="20" height="26" rx="2" fill="#59634b"/>
        <circle cx="150" cy="311" r="5" fill="#88745b"/>
      </svg>`;
    case "mandorle":
      return `<svg viewBox="0 0 260 400" role="img" aria-label="Sacchetto di mandorle in guscio da 250 g">${sacchetto(40, 90, 180, 290)}</svg>`;
    case "combo":
      return `<svg viewBox="0 0 320 400" role="img" aria-label="Bottiglia da 500 ml e sacchetto di mandorle">
        ${bottle(30, 20, 370, "PRECOCE")}${sacchetto(150, 150, 150, 240)}</svg>`;
  }
  return "";
}

/* ---------- Header e footer condivisi ---------- */
function renderChrome() {
  const here = location.pathname.split("/").pop() || "index.html";
  const links = [
    ["precoce.html", "Precoce"],
    ["quotidiano.html", "Quotidiano 3 L"],
    ["perche.html", "Perché pizzica"],
    ["chi-siamo.html", "Chi siamo"],
    ["mandorle.html", "Mandorle"]
  ];
  const nav = links.map(([h, t]) => `<a href="${h}"${h === here ? ' aria-current="page"' : ""}>${t}</a>`).join("");

  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      ${SITE.prototipo ? `<div class="proto-bar">Prototipo — comune, foto, contatti e condizioni sono segnaposto da sostituire</div>` : ""}
      <div class="wrap">
        <a class="logo" href="index.html">TERRE ASPRE</a>
        <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
        <nav class="nav" id="nav">${nav}</nav>
        <a class="cart-link" href="carrello.html" aria-label="Carrello">Carrello <span class="cart-count" data-cart-count>0</span></a>
      </div>`;
    const btn = header.querySelector(".menu-btn");
    const navEl = header.querySelector(".nav");
    btn.addEventListener("click", () => {
      const open = navEl.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="wrap">
        <div class="top">
          <div>
            <a class="logo" href="index.html">TERRE ASPRE</a>
            <p class="payoff">L'asprezza è la prova.</p>
            <p class="small">Olio extravergine di oliva. Coratina monovarietale da raccolta precoce, molita a <span class="ph" data-site="comune"></span> (<span data-site="provincia"></span>).</p>
          </div>
          <div>
            <h4>L'olio</h4>
            <ul>
              <li><a href="precoce.html">Precoce · 250 e 500 ml</a></li>
              <li><a href="precoce.html#box">Box 3 × 500 ml</a></li>
              <li><a href="quotidiano.html">Quotidiano · 3 L</a></li>
            </ul>
          </div>
          <div>
            <h4>Aiuto</h4>
            <ul>
              <li><a href="aiuto.html#spedizioni">Spedizioni</a></li>
              <li><a href="aiuto.html#pagamenti">Pagamenti</a></li>
              <li><a href="aiuto.html#conservazione">Conservazione</a></li>
              <li><a href="aiuto.html#domande">Domande frequenti</a></li>
            </ul>
          </div>
          <div>
            <h4>Altro</h4>
            <ul>
              <li><a href="professionisti.html">Ristorazione e professionisti</a></li>
              <li><a href="chi-siamo.html">Chi siamo</a></li>
              <li><a href="mandorle.html">Mandorle in guscio</a></li>
              <li><a href="prossimamente.html">In arrivo: cereali</a></li>
              <li><span class="ph" data-site="email"></span></li>
            </ul>
          </div>
        </div>
        <div class="bottom">
          <span><span class="ph" data-site="azienda"></span> · <span class="ph" data-site="piva"></span></span>
          <span><a href="aiuto.html#legale">Condizioni di vendita</a> · <a href="aiuto.html#legale">Privacy</a> · <a href="aiuto.html#legale">Cookie</a></span>
        </div>
      </div>`;
  }

  if (!document.querySelector(".toast")) {
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
}

function toast(msg) {
  const t = document.querySelector(".toast");
  t.innerHTML = `<span>${msg}</span><a href="carrello.html">Vai al carrello</a>`;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ---------- Riempimento dati ---------- */
function bindData(root = document) {
  root.querySelectorAll("[data-site]").forEach(el => {
    const k = el.dataset.site;
    let v = SITE[k];
    if (k === "sogliaSpedizione" || k === "costoSpedizione") v = euro(v);
    el.textContent = v;
  });
  root.querySelectorAll("[data-price]").forEach(el => { el.textContent = euro(PRODUCTS[el.dataset.price].prezzo); });
  root.querySelectorAll("[data-unit]").forEach(el => { el.textContent = unitaPrezzo(PRODUCTS[el.dataset.unit]); });
  root.querySelectorAll("[data-art]").forEach(el => { el.innerHTML = art(el.dataset.art); });
  root.querySelectorAll("[data-foto]").forEach(renderFoto);
}

// <figure data-foto="raccolta" data-caption="..."> → foto vera se il file esiste, altrimenti segnaposto con le istruzioni
function renderFoto(fig) {
  const f = FOTO[fig.dataset.foto];
  if (!f) return;
  fig.classList.add("foto");
  fig.style.setProperty("--ratio", fig.dataset.rapporto || f.rapporto);
  const caption = fig.dataset.caption ? `<figcaption>${fig.dataset.caption}</figcaption>` : "";
  const img = new Image();
  img.alt = f.alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => {
    fig.classList.add("foto-ph");
    fig.innerHTML = `<div class="foto-box"><div><strong>Foto · ${f.file}</strong>${f.brief}</div></div>${caption}`;
  };
  img.src = "assets/foto/" + f.file;
  fig.innerHTML = "";
  const box = document.createElement("div");
  box.className = "foto-box";
  box.appendChild(img);
  fig.appendChild(box);
  if (caption) fig.insertAdjacentHTML("beforeend", caption);
}

/* ---------- Scorte: esaurito e ultimi pezzi ---------- */
// Le scorte vive arrivano da /api/scorte (scalate a ogni pagamento); in anteprima locale si usa /scorte.json.
// Se non si legge nessuno dei due, il sito non blocca nulla: il controllo vero lo fa il checkout.
let SCORTE = null;
const UNITA = {
  "precoce-250": ["bottiglia", "bottiglie", "Ultima", "Ultime"],
  "precoce-500": ["bottiglia", "bottiglie", "Ultima", "Ultime"],
  "precoce-box": ["box", "box", "Ultimo", "Ultimi"],
  "quotidiano-3l": ["sacca", "sacche", "Ultima", "Ultime"],
  "mandorle-250": ["sacchetto", "sacchetti", "Ultimo", "Ultimi"],
  "combo-mandorle": ["combo", "combo", "Ultima", "Ultime"]
};

// pezzi di base usati da un prodotto: la combo usa i suoi componenti, gli altri sé stessi
const componenti = id => PRODUCTS[id]?.componenti || { [id]: 1 };

async function caricaScorte() {
  for (const url of ["/api/scorte", "scorte.json"]) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const dati = await r.json();
      if (dati?.prodotti) { SCORTE = dati; return; }
    } catch { /* prova il prossimo */ }
  }
}

// riservati = pezzi di base già nel carrello, da togliere dalla disponibilità
function scorta(id, riservati = {}) {
  if (!SCORTE) return { n: Infinity, esaurito: false, pochi: false };
  const n = Math.min(...Object.entries(componenti(id)).map(([base, q]) =>
    Math.floor(Math.max(0, (Number(SCORTE.prodotti?.[base]) || 0) - (riservati[base] || 0)) / q)));
  return { n, esaurito: n === 0, pochi: n > 0 && n <= (SCORTE.sogliaPochi ?? 10) };
}

// pezzi di base occupati dal carrello, esclusa eventualmente una riga
function usoCarrello(esclusoId) {
  const uso = {};
  for (const i of Cart.items()) {
    if (i.id === esclusoId) continue;
    for (const [base, q] of Object.entries(componenti(i.id))) uso[base] = (uso[base] || 0) + q * i.qty;
  }
  return uso;
}

function etichettaScorta(id) {
  const s = scorta(id);
  if (s.esaurito) return "Esaurito";
  if (!s.pochi) return PRODUCTS[id]?.inEsaurimento ? "In esaurimento" : "";
  const [uno, molti, ult1, ultN] = UNITA[id];
  return s.n === 1 ? `${ult1} ${uno}` : `${ultN} ${s.n} ${molti}`;
}

const litriRimasti = () => SCORTE
  ? Object.entries(SCORTE.prodotti || {}).reduce((t, [id, n]) => t + (PRODUCTS[id]?.litri ? PRODUCTS[id].litri * Math.max(0, n) : 0), 0)
  : null;

function applicaScorte() {
  if (!SCORTE) return;

  // etichette ovunque: <span data-stock="precoce-500"></span>
  document.querySelectorAll("[data-stock]").forEach(el => {
    const s = scorta(el.dataset.stock);
    el.textContent = etichettaScorta(el.dataset.stock);
    el.className = "stock" + (s.esaurito ? " esaurito" : s.pochi ? " pochi" : PRODUCTS[el.dataset.stock]?.inEsaurimento ? " esaurimento" : "");
    el.hidden = !el.textContent;
  });

  // schede della home
  document.querySelectorAll(".prod[data-sku]").forEach(card => {
    const s = scorta(card.dataset.sku);
    card.classList.toggle("soldout", s.esaurito);
    const b = card.querySelector(".btn");
    if (b && s.esaurito) b.textContent = "Esaurito";
  });

  // chili rimasti di un prodotto a peso: <span data-kg="mandorle-250"></span>
  document.querySelectorAll("[data-kg]").forEach(el => {
    const p = PRODUCTS[el.dataset.kg];
    const kg = Math.max(0, Number(SCORTE.prodotti?.[el.dataset.kg]) || 0) * (p?.kg || 0);
    el.textContent = kg === 0 ? "finite" : `circa ${kg.toLocaleString("it-IT", { maximumFractionDigits: 1 })} kg`;
  });

  // litri rimasti della raccolta
  const l = litriRimasti();
  document.querySelectorAll("[data-litri-n]").forEach(el => { el.textContent = Math.round(l); });
  document.querySelectorAll("[data-litri]").forEach(el => {
    el.textContent = l === 0 ? "Raccolta esaurita" : `circa ${Math.round(l)} L`;
  });

  // pagine prodotto
  document.querySelectorAll("form[data-buy]").forEach(form => {
    const radios = [...form.querySelectorAll("input[name=sku][type=radio]")];
    radios.forEach(r => {
      const s = scorta(r.value);
      r.disabled = s.esaurito;
      r.closest(".opt")?.classList.toggle("soldout", s.esaurito);
    });
    const checked = radios.find(r => r.checked);
    if (checked && checked.disabled) {
      const libero = radios.find(r => !r.disabled);
      if (libero) { libero.checked = true; libero.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    syncBuyForm(form);
  });
}

// Limita quantità e pulsante del modulo d'acquisto al formato scelto
function syncBuyForm(form) {
  const sel = form.querySelector("input[name=sku]:checked") || form.querySelector("input[name=sku][type=hidden]");
  const submit = form.querySelector("button[type=submit]");
  const qty = form.querySelector("input[name=qty]");
  const s = sel ? scorta(sel.value) : { n: Infinity, esaurito: false };
  const max = Math.min(24, s.n);
  qty.max = String(Math.max(1, max));
  if (+qty.value > max) qty.value = Math.max(1, max);
  submit.disabled = !sel || s.esaurito;
  submit.textContent = s.esaurito ? "Esaurito" : "Aggiungi al carrello";
}

/* ---------- Pagine prodotto ---------- */
function initBuyForms() {
  document.querySelectorAll("form[data-buy]").forEach(form => {
    const qtyInput = form.querySelector("input[name=qty]");
    form.querySelectorAll("[data-step]").forEach(b => b.addEventListener("click", () => {
      const max = +qtyInput.max || 24;
      qtyInput.value = Math.max(1, Math.min(max, (+qtyInput.value || 1) + +b.dataset.step));
    }));

    const artBox = document.querySelector("[data-pdp-art]");
    const syncArt = () => {
      const sel = form.querySelector("input[name=sku]:checked");
      if (artBox && sel) artBox.innerHTML = art(PRODUCTS[sel.value].art);
      syncBuyForm(form);
    };
    form.addEventListener("change", syncArt);
    syncArt();

    form.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(form);
      const id = fd.get("sku");
      aggiungi(id, Math.max(1, +fd.get("qty") || 1));
    });
  });

  document.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
    aggiungi(b.dataset.add, 1);
    if (document.querySelector("[data-cart]")) renderCart();
  }));

  // Se si arriva su precoce.html#box o #250, preseleziona il formato
  const hash = location.hash.replace("#", "");
  const pre = { box: "precoce-box", "250": "precoce-250", "500": "precoce-500", combo: "combo-mandorle" }[hash];
  if (pre) {
    const r = document.querySelector(`input[name=sku][value="${pre}"]`);
    if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); }
  }
}

// Aggiunge al carrello senza superare i pezzi disponibili
function aggiungi(id, qty) {
  const s = scorta(id);
  const giaDentro = Cart.items().find(i => i.id === id)?.qty || 0;
  const liberi = scorta(id, usoCarrello(id)).n; // contando anche le altre righe che usano gli stessi pezzi
  const possibili = Math.min(qty, Math.min(24, liberi) - giaDentro);
  if (s.esaurito) { toast(`${PRODUCTS[id].nome}: esaurito`); return; }
  if (possibili <= 0) { toast(`Hai già nel carrello tutti i pezzi disponibili di ${PRODUCTS[id].nome}`); return; }
  Cart.add(id, possibili);
  toast(possibili < qty
    ? `Disponibili solo ${possibili}: aggiunti ${possibili} × ${PRODUCTS[id].nome}`
    : `${possibili} × ${PRODUCTS[id].nome} nel carrello`);
}

/* ---------- Carrello ---------- */
function renderCart() {
  const box = document.querySelector("[data-cart]");
  if (!box) return;
  // riallinea il carrello alle scorte: quantità ridotte ai pezzi rimasti, righe esaurite segnalate
  const ridotti = [];
  Cart.items().forEach(i => {
    const s = scorta(i.id);
    const n = scorta(i.id, usoCarrello(i.id)).n;
    if (!s.esaurito && i.qty > n) { Cart.setQty(i.key, Math.max(1, n)); ridotti.push(PRODUCTS[i.id].nome); }
  });
  const items = Cart.items();
  const esauriti = items.filter(i => scorta(i.id).esaurito);
  const sub = Cart.subtotal();
  const soglia = SITE.sogliaSpedizione;
  const sped = items.length === 0 || sub >= soglia ? 0 : SITE.costoSpedizione;
  const linesEl = box.querySelector("[data-lines]");
  const sumEl = box.querySelector("[data-summary]");

  if (!items.length) {
    linesEl.innerHTML = `<div class="empty"><p class="lead">Il carrello è vuoto.</p><a class="btn" href="precoce.html">Scegli il formato</a></div>`;
    sumEl.hidden = true;
    return;
  }
  sumEl.hidden = false;

  linesEl.innerHTML = items.map(i => {
    const p = PRODUCTS[i.id];
    const tag = etichettaScorta(i.id);
    const s = scorta(i.id);
    return `
      <div class="cart-line${s.esaurito ? " soldout" : ""}">
        <div class="thumb">${art(p.art)}</div>
        <div>
          <div class="name">${p.nome}</div>
          <div class="meta">${[p.formato, perLitro(p)].filter(Boolean).join(" · ")}</div>
          ${tag ? `<span class="stock${s.esaurito ? " esaurito" : s.pochi ? " pochi" : " esaurimento"}">${s.esaurito ? "Esaurito: rimuovilo per procedere" : tag}</span>` : ""}
        </div>
        <div class="right">
          <div class="qty">
            <button type="button" data-q="${i.key}" data-d="-1" aria-label="Diminuisci">−</button>
            <input type="number" value="${i.qty}" min="1" max="24" aria-label="Quantità" data-qi="${i.key}">
            <button type="button" data-q="${i.key}" data-d="1" aria-label="Aumenta">+</button>
          </div>
          <strong>${euro(p.prezzo * i.qty)}</strong>
          <button type="button" class="link-btn" data-rm="${i.key}">Rimuovi</button>
        </div>
      </div>`;
  }).join("");

  const manca = Math.max(0, soglia - sub);
  const hasBox = items.some(i => i.id === "precoce-box" || i.id === "quotidiano-3l");
  sumEl.innerHTML = `
    <div class="boxed">
      <h3>Riepilogo</h3>
      <div class="row"><span>Prodotti</span><span>${euro(sub)}</span></div>
      <div class="row"><span>Spedizione</span><span>${sped === 0 ? "Gratuita" : euro(sped)}</span></div>
      <div class="progress" aria-hidden="true"><span style="width:${Math.min(100, sub / soglia * 100)}%"></span></div>
      <p class="small muted">${manca > 0 ? `Mancano ${euro(manca)} alla spedizione gratuita (da ${euro(soglia)}).` : "La spedizione è gratuita."}</p>
      <div class="row total"><span>Totale</span><span>${euro(sub + sped)}</span></div>
      <p class="small muted">Prezzi IVA inclusa.</p>
      <button class="btn btn-block" type="button" data-checkout${esauriti.length ? " disabled" : ""}>Procedi al pagamento</button>
      <p class="small" style="color:var(--rust);margin:10px 0 0" role="alert" data-checkout-msg>${
        esauriti.length ? "Nel carrello c'è un prodotto esaurito: rimuovilo per procedere."
        : ridotti.length ? `Quantità ridotta ai pezzi rimasti: ${ridotti.join(", ")}.` : ""}</p>
      <p class="small muted" style="margin:10px 0 0">Pagamento sicuro con Stripe: carta, Apple Pay, Google Pay.</p>
      ${manca > 0 && !hasBox ? `
      <div class="upsell">
        <strong>Il box da tre supera la soglia da solo.</strong>
        Tre bottiglie da 500 ml, spedizione inclusa: ${euro(PRODUCTS["precoce-box"].prezzo)}.
        <div style="margin-top:12px"><button class="btn btn-ghost" type="button" data-add="precoce-box">Aggiungi il box</button></div>
      </div>` : ""}
    </div>`;

  box.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
    const it = Cart.items().find(i => i.key === b.dataset.q);
    if (+b.dataset.d > 0 && it.qty >= scorta(it.id, usoCarrello(it.id)).n) { toast(`Non ci sono altri pezzi di ${PRODUCTS[it.id].nome}`); return; }
    Cart.setQty(b.dataset.q, it.qty + +b.dataset.d);
    renderCart();
  }));
  box.querySelectorAll("[data-qi]").forEach(inp => inp.addEventListener("change", () => {
    Cart.setQty(inp.dataset.qi, Math.max(0, +inp.value || 0));
    renderCart();
  }));
  box.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => { Cart.setQty(b.dataset.rm, 0); renderCart(); }));
  box.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => { aggiungi(b.dataset.add, 1); renderCart(); }));
  box.querySelector("[data-checkout]").addEventListener("click", checkout);
}

// Manda codici e quantità alla funzione /api/checkout, che crea la sessione Stripe e restituisce l'URL di pagamento.
async function checkout(e) {
  const btn = e.currentTarget;
  const msg = document.querySelector("[data-checkout-msg]");
  btn.disabled = true;
  btn.textContent = "Apertura del pagamento…";
  msg.textContent = "";
  try {
    const items = Cart.items().map(({ id, qty }) => ({ id, qty }));
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) { location.href = data.url; return; }
    msg.textContent = data.errore || ([404, 405, 501].includes(res.status)
      ? "Il pagamento funziona solo sul sito pubblicato, non nell'anteprima locale."
      : "Il pagamento non è disponibile in questo momento. Riprova tra poco.");
  } catch {
    msg.textContent = "Connessione assente. Controlla la rete e riprova.";
  }
  btn.disabled = false;
  btn.textContent = "Procedi al pagamento";
}

/* ---------- Moduli dimostrativi ---------- */
// I moduli con data-netlify vengono raccolti da Netlify Forms: invio in background, risposta nella pagina.
function initForms() {
  document.querySelectorAll("form[data-netlify]").forEach(f => f.addEventListener("submit", async e => {
    e.preventDefault();
    const msg = f.querySelector(".form-msg");
    const btn = f.querySelector("button[type=submit]");
    const say = (text, cls) => { if (msg) { msg.textContent = text; msg.className = "form-msg " + cls; } };
    btn.disabled = true;
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(f)).toString()
      });
      if (res.ok) {
        f.classList.add("sent");
        f.querySelectorAll("input, select, textarea").forEach(el => { el.disabled = true; });
        say(f.dataset.ok || "Fatto. Ti scriviamo quando è il momento.", "ok");
        return;
      }
      say([404, 405, 501].includes(res.status)
        ? "I moduli funzionano solo sul sito pubblicato, non nell'anteprima locale."
        : "Invio non riuscito. Riprova tra poco.", "err");
    } catch {
      say("Connessione assente. Controlla la rete e riprova.", "err");
    }
    btn.disabled = false;
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  if (SITE.prototipo) document.body.classList.add("proto");
  if (document.body.dataset.page === "grazie") store.set("ta-cart", []);
  renderChrome();
  bindData();
  initBuyForms();
  renderCart();
  initForms();
  updateCartCount();
  caricaScorte().then(() => { applicaScorte(); renderCart(); });
});
