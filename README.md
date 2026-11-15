# odhadysuchanek.cz

Web Ing. Bohdana Suchanka – odhady nemovitostí a znalecké posudky, Český Těšín a okolí.
Jedna stránka v [Astru](https://astro.build), hosting Vercel.

## Spuštění

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # statický výstup do dist/
```

## Kde co upravit

| Co | Soubor |
|---|---|
| Texty, ceník, časté dotazy, kontakty | `src/data/site.ts` |
| Fotka do úvodu | `src/assets/portret.jpg` |
| Zpracování osobních údajů | `src/pages/ochrana-osobnich-udaju.astro` |
| Bezpečnostní hlavičky | `vercel.json` |

V `src/data/site.ts` je u každého bloku poznámka `OVĚŘENO` (údaj ze seznamu znalců Ministerstva
spravedlnosti) nebo `NÁVRH` (pracovní text či cena, kterou má potvrdit pan Suchanek).

### Fotka

V úvodu je `src/assets/portret.jpg` – čtvercový výřez z fotky z předávání ocenění (pan Suchanek
si podává ruku s předávajícím). Vyrábí ho `node scripts/portret.mjs` z původního snímku
`scripts/assets/portret-puvodni.jpeg`; výřez se nastavuje konstantou nahoře ve skriptu. Původní
snímek se do gitu neukládá, na web jde jen zmenšený výřez.

Jinou fotku stačí uložit jako `src/assets/portret.jpg` (aspoň 1100 px na šířku). Web si ji ořízne
na čtverec a zmenší. Bez fotky se zobrazí zástupná silueta. Popis fotky pro čtečky a vyhledávače
je v `src/data/site.ts` (`uvod.fotka`).

### Formulář

Poptávku přijme funkce `api/poptavka.ts` a pošle ji e-mailem přes [Resend](https://resend.com).
Ve Vercelu (Settings → Environment Variables) nastavte:

| Proměnná | Hodnota |
|---|---|
| `RESEND_API_KEY` | klíč z Resendu |
| `CONTACT_EMAIL` | adresa, kam mají poptávky chodit |
| `CONTACT_FROM` | odesílatel, např. `Web odhadysuchanek.cz <poptavka@odhadysuchanek.cz>` – doména musí být v Resendu ověřená |

Dokud klíč chybí, formulář na webu ohlásí, že se poptávku nepodařilo odeslat, a nabídne telefon
a e-mail. Při `npm run dev` bez klíče běží nanečisto: e-mail se neodešle, jen se vypíše do konzole.

### Plán města, náhledový obrázek a ikony

V pozadí úvodu je skutečný plán centra Českého Těšína z dat OpenStreetMap. Soubor
`src/assets/mapa-tesin.svg` vyrábí `node scripts/mapa-tesina.mjs` (výřez a měřítko jsou nahoře
ve skriptu; s `--stahnout` si data stáhne znovu).

`bash scripts/generate-assets.sh` vygeneruje `public/og.png`, `favicon.ico` a `apple-touch-icon.png`
(potřebuje Google Chrome). Spusťte ho znovu po změně jména nebo plánu města.

## Před spuštěním

1. Projít s panem Suchankem všechno označené `NÁVRH` v `src/data/site.ts` – hlavně ceník
   a výčet obcí.
2. Nastavit proměnné pro formulář a poslat si zkušební poptávku z nasazeného webu.
3. Ve Vercelu připojit doménu `odhadysuchanek.cz` jako hlavní a `www` na ni přesměrovat
   (web má kanonické adresy bez `www`).
4. Smazat `middleware.js` – drží testovací web za heslem a mimo vyhledávače.

Pro AI agenty jsou konvence projektu v [AGENTS.md](AGENTS.md).
