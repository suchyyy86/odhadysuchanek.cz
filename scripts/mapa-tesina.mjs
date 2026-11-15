#!/usr/bin/env node
// Vyrobí src/assets/mapa-tesin.svg – skutečný plán centra Českého Těšína, který tvoří pozadí úvodu.
//
// Zdroj dat: OpenStreetMap (© přispěvatelé OpenStreetMap, licence ODbL) přes Overpass API.
// Na webu je proto v patičce uvedený zdroj mapy – nemazat.
//
//   node scripts/mapa-tesina.mjs             použije data z .cache/tesin-osm.json, jinak je stáhne
//   node scripts/mapa-tesina.mjs --stahnout  stáhne data znovu
//
// Výřez se nastavuje konstantami níže. Kresba je na webu přisazená k pravému okraji úvodu
// a svisle vystředěná na portrét.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(KOREN, '.cache', 'tesin-osm.json');
const VYSTUP = path.join(KOREN, 'src', 'assets', 'mapa-tesin.svg');

// ── Výřez ───────────────────────────────────────────────────────────────────────────────────────
/** Kotva: most Družby na konci Hlavní třídy. Podle něj se celý výřez umisťuje. */
const KOTVA = { lat: 49.74935, lon: 18.62668 };
/** Kde má kotva v kresbě ležet (kresba je 1000 × 1000, pravý okraj = pravý okraj úvodu). */
const KOTVA_V_KRESBE = { x: 925, y: 440 };
/** Natočení po směru hodin ve stupních. Sever tedy není přesně nahoře: Olše díky tomu běží
    svisle podél pravého okraje a Hlavní třída míří k mostu zleva. */
const NATOCENI = 30;
/** Měřítko: kolik metrů ve skutečnosti připadá na jednu jednotku kresby. */
const METRU_NA_JEDNOTKU = 1.1;
/** Kresba se ořízne na tuhle část čtverce 0–1000 – zbytek by na webu stejně nebyl vidět. */
const ROZSAH = { x0: 60, x1: 1000, y0: 160, y1: 840 };
/** V jaké výšce kresby (0 nahoře, 1000 dole) začíná popisek řeky. */
const VYSKA_POPISKU = 640;
/** Oblast, která se stahuje z OpenStreetMap (jih, západ, sever, východ). */
const OBLAST = [49.739, 18.61, 49.756, 18.642];

const DOTAZ = `[out:json][timeout:90];
(
  way["building"](${OBLAST});
  way["highway"~"^(primary|secondary|tertiary|residential|unclassified|living_street|pedestrian|primary_link|secondary_link|tertiary_link)$"](${OBLAST});
  way["railway"="rail"](${OBLAST});
  way["waterway"~"^(river|stream|canal)$"](${OBLAST});
  way["natural"="water"](${OBLAST});
  relation["natural"="water"](${OBLAST});
);
out geom;`;

const SERVERY = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

async function stahni() {
  for (const server of SERVERY) {
    try {
      const odpoved = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(DOTAZ),
        signal: AbortSignal.timeout(150_000),
      });
      if (!odpoved.ok) throw new Error(`HTTP ${odpoved.status}`);
      const data = await odpoved.json();
      if (!Array.isArray(data.elements) || data.elements.length < 100) throw new Error('prázdná odpověď');
      fs.mkdirSync(path.dirname(CACHE), { recursive: true });
      fs.writeFileSync(CACHE, JSON.stringify(data));
      console.log(`Staženo z ${server}: ${data.elements.length} prvků.`);
      return data;
    } catch (chyba) {
      console.warn(`${server} neodpověděl (${chyba.message}), zkouším další…`);
    }
  }
  throw new Error('Mapová data se nepodařilo stáhnout z žádného serveru. Zkuste to později.');
}

const data =
  process.argv.includes('--stahnout') || !fs.existsSync(CACHE) ? await stahni() : JSON.parse(fs.readFileSync(CACHE, 'utf8'));

// ── Geometrie ───────────────────────────────────────────────────────────────────────────────────
const NA_STUPEN_SIRKY = 110_574;
const NA_STUPEN_DELKY = 111_320 * Math.cos((KOTVA.lat * Math.PI) / 180);
const UHEL = (NATOCENI * Math.PI) / 180;

/** Zeměpisné souřadnice → jednotky kresby (metry od kotvy, natočení, měřítko, posun na místo kotvy). */
const doKresby = ({ lat, lon }) => {
  const vychod = (lon - KOTVA.lon) * NA_STUPEN_DELKY;
  const jih = (KOTVA.lat - lat) * NA_STUPEN_SIRKY;
  return [
    KOTVA_V_KRESBE.x + (vychod * Math.cos(UHEL) - jih * Math.sin(UHEL)) / METRU_NA_JEDNOTKU,
    KOTVA_V_KRESBE.y + (vychod * Math.sin(UHEL) + jih * Math.cos(UHEL)) / METRU_NA_JEDNOTKU,
  ];
};

const uvnitr = ([x, y], presah = 0) =>
  x >= ROZSAH.x0 - presah && x <= ROZSAH.x1 + presah && y >= ROZSAH.y0 - presah && y <= ROZSAH.y1 + presah;

/** Zjednodušení lomené čáry (Douglas–Peucker). */
function zjednodus(body, tolerance) {
  if (body.length < 3) return body;
  const [ax, ay] = body[0];
  const [bx, by] = body[body.length - 1];
  const delka = Math.hypot(bx - ax, by - ay);
  let nejdal = 0;
  let index = 0;
  for (let i = 1; i < body.length - 1; i++) {
    const [px, py] = body[i];
    const vzdalenost =
      delka === 0 ? Math.hypot(px - ax, py - ay) : Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / delka;
    if (vzdalenost > nejdal) {
      nejdal = vzdalenost;
      index = i;
    }
  }
  if (nejdal <= tolerance) return [body[0], body[body.length - 1]];
  return [...zjednodus(body.slice(0, index + 1), tolerance).slice(0, -1), ...zjednodus(body.slice(index), tolerance)];
}

const plocha = (body) => {
  let s = 0;
  for (let i = 0; i < body.length - 1; i++) s += body[i][0] * body[i + 1][1] - body[i + 1][0] * body[i][1];
  return Math.abs(s) / 2;
};

/** Lomenou čáru rozdělí na úseky, které leží ve výřezu (s jedním bodem přesahu na každém konci). */
function useky(body, presah) {
  const vysledek = [];
  let usek = [];
  body.forEach((bod, i) => {
    const blizko = uvnitr(bod, presah) || (i > 0 && uvnitr(body[i - 1], presah)) || (i < body.length - 1 && uvnitr(body[i + 1], presah));
    if (blizko) usek.push(bod);
    else if (usek.length) {
      if (usek.length > 1) vysledek.push(usek);
      usek = [];
    }
  });
  if (usek.length > 1) vysledek.push(usek);
  return vysledek;
}

const z = (n) => Math.round(n);

/** Body → zápis cesty SVG s relativními souřadnicemi (kratší než absolutní). */
function cesta(body, uzavrit) {
  const cele = body.map(([x, y]) => [z(x), z(y)]).filter((b, i, vse) => i === 0 || b[0] !== vse[i - 1][0] || b[1] !== vse[i - 1][1]);
  if (uzavrit && cele.length > 1 && cele[0][0] === cele.at(-1)[0] && cele[0][1] === cele.at(-1)[1]) cele.pop();
  if (cele.length < (uzavrit ? 3 : 2)) return '';
  let d = `M${cele[0][0]} ${cele[0][1]}l`;
  for (let i = 1; i < cele.length; i++) {
    const dx = cele[i][0] - cele[i - 1][0];
    const dy = cele[i][1] - cele[i - 1][1];
    d += `${i > 1 && dx >= 0 ? ' ' : ''}${dx}${dy >= 0 ? ' ' : ''}${dy}`;
  }
  return d + (uzavrit ? 'z' : '');
}

// ── Roztřídění prvků ────────────────────────────────────────────────────────────────────────────
// Uzly, které sdílí víc ploch řeky (viz níže u vody).
const vyskyty = new Map();
for (const prvek of data.elements) {
  if (prvek.tags?.natural !== 'water' || prvek.tags?.water !== 'river') continue;
  for (const uzel of new Set(prvek.nodes)) vyskyty.set(uzel, (vyskyty.get(uzel) ?? 0) + 1);
}
const spolecneUzly = new Set([...vyskyty].filter(([, pocet]) => pocet > 1).map(([uzel]) => uzel));

const HLAVNI = new Set(['primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link']);
const vrstvy = { budovy: [], hlavni: [], ulice: [], zeleznice: [], voda: [], potoky: [] };
let tokReky = [];

for (const prvek of data.elements) {
  if (prvek.type !== 'way' || !prvek.geometry) continue;
  const stitky = prvek.tags ?? {};
  const body = prvek.geometry.map(doKresby);

  if (stitky.building) {
    if (!body.some((b) => uvnitr(b))) continue;
    const obrys = zjednodus(body, 0.45);
    if (plocha(obrys) < 22) continue; // kůlny a přístřešky by v měřítku plánu jen dělaly šum
    vrstvy.budovy.push(cesta(obrys, true));
  } else if (stitky.highway) {
    for (const usek of useky(body, 12)) (HLAVNI.has(stitky.highway) ? vrstvy.hlavni : vrstvy.ulice).push(cesta(zjednodus(usek, 0.5), false));
  } else if (stitky.railway) {
    if (stitky.tunnel) continue;
    for (const usek of useky(body, 12)) vrstvy.zeleznice.push(cesta(zjednodus(usek, 0.4), false));
  } else if (stitky.natural === 'water') {
    if (!body.some((b) => uvnitr(b, 30))) continue;
    if (stitky.water !== 'river') {
      vrstvy.voda.push(cesta(zjednodus(body, 0.5), true));
      continue;
    }
    // Řeka je v datech rozdělená na několik ploch. Hrany, kterými na sebe plochy navazují, vedou
    // napříč korytem a v kresbě by vypadaly jako hráze – kreslíme proto jen břehy.
    let breh = [];
    prvek.nodes.forEach((uzel, i) => {
      const napric = i > 0 && spolecneUzly.has(uzel) && spolecneUzly.has(prvek.nodes[i - 1]);
      if (napric) {
        if (breh.length > 1) vrstvy.voda.push(cesta(zjednodus(breh, 0.5), false));
        breh = [];
      }
      breh.push(body[i]);
    });
    if (breh.length > 1) vrstvy.voda.push(cesta(zjednodus(breh, 0.5), false));
  } else if (stitky.waterway === 'river' && /Ol[šz]/.test(stitky.name ?? '')) {
    const usek = useky(body, 40).sort((a, b) => b.length - a.length)[0];
    if (usek) tokReky = zjednodus(usek, 0.6);
  } else if (stitky.waterway) {
    for (const usek of useky(body, 12)) vrstvy.potoky.push(cesta(zjednodus(usek, 0.6), false));
  }
}

if (!tokReky.length) throw new Error('V datech chybí řeka Olše – zkontrolujte výřez.');

// Popisek řeky se sází podél toku, který v kresbě běží svisle. Cesta vede zdola nahoru,
// takže se popisek čte jako hřbet knihy – zdola nahoru.
const zdola = tokReky[0][1] > tokReky.at(-1)[1] ? tokReky : [...tokReky].reverse();
const tok = cesta(zdola, false);

const spoj = (casti) => casti.filter(Boolean).join('');
const d = Object.fromEntries(Object.entries(vrstvy).map(([nazev, casti]) => [nazev, spoj(casti)]));

// ── SVG ─────────────────────────────────────────────────────────────────────────────────────────
// Soubor se na webu vkládá jako obrázek, takže si nese barvy v sobě (bílá kresba na průhledném pozadí).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
<defs>
<pattern id="s" width="4.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4.2" stroke="#fff" stroke-width="1"/></pattern>
<path id="tok" d="${tok}"/>
</defs>
<g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
<g opacity=".075"><path d="${d.ulice}" stroke-width="6.5"/><path d="${d.hlavni}" stroke-width="9"/></g>
<g opacity=".34">
<path d="${d.voda}" stroke-width=".9"/>
<path d="${d.potoky}" stroke-width=".7"/>
<use href="#tok" stroke-width=".7" stroke-dasharray="9 15"/>
<path d="${d.zeleznice}" stroke-width=".9"/>
<path d="${d.zeleznice}" stroke-width="4.5" stroke-dasharray=".9 6" stroke-linecap="butt"/>
<path d="${d.budovy}" stroke-width=".8" fill="url(#s)"/>
<text fill="#fff" stroke="none" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-size="13" letter-spacing="5" dy="4.5"><textPath href="#tok" startOffset="__POPISEK__%">Olše</textPath></text>
</g>
</g>
</svg>
`;

// Popisek řeky patří do míst, která jsou na webu vidět: kousek pod polovinu výšky kresby.
const delky = [0];
for (let i = 1; i < zdola.length; i++) delky.push(delky[i - 1] + Math.hypot(zdola[i][0] - zdola[i - 1][0], zdola[i][1] - zdola[i - 1][1]));
const cil = zdola.findIndex(([, y]) => y <= VYSKA_POPISKU);
const popisek = Math.round(((delky[Math.max(cil, 0)] ?? 0) / delky.at(-1)) * 100);

fs.mkdirSync(path.dirname(VYSTUP), { recursive: true });
fs.writeFileSync(VYSTUP, svg.replace('__POPISEK__', String(popisek)));

const kb = (text) => (Buffer.byteLength(text) / 1024).toFixed(1) + ' kB';
console.log(
  `Hotovo: ${path.relative(KOREN, VYSTUP)} (${kb(svg)}) – budov ${vrstvy.budovy.length}, ` +
    `ulice ${kb(d.ulice + d.hlavni)}, železnice ${kb(d.zeleznice)}, budovy ${kb(d.budovy)}, voda ${kb(d.voda + tok)}.`,
);
