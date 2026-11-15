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

Uložte portrét jako `src/assets/portret.jpg` (stačí 1200 px na šířku, ideálně na výšku). Zástupná
silueta zmizí sama, web si fotku ořízne na poměr 4 : 5 a zmenší.

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
2. Doplnit fotku.
3. Nastavit proměnné pro formulář a poslat si zkušební poptávku z nasazeného webu.
4. Ve Vercelu připojit doménu `odhadysuchanek.cz` jako hlavní a `www` na ni přesměrovat
   (web má kanonické adresy bez `www`).

Pro AI agenty jsou konvence projektu v [AGENTS.md](AGENTS.md).
