# odhadysuchanek.cz – poznámky pro AI agenty

Web Ing. Bohdana Suchanka, znalce pro oceňování nemovitostí z Českého Těšína. Jedna stránka s jediným
cílem: aby se návštěvník ozval (telefon nebo poptávkový formulář). Astro 7, statický výstup, hosting
Vercel. Obsah je česky, píše se v první osobě („oceňuji“, „ozvu se vám“).

## Vývoj

```bash
npm run dev -- --port 4331   # 4321 používá suchanek.dev
npm run build                # musí projít bez chyb
npx astro check              # typová kontrola
```

## Kde co je

| Co | Soubor |
|---|---|
| Všechny texty, ceník, dotazy, kontakty | `src/data/site.ts` |
| Úvodní stránka (pořadí sekcí) | `src/pages/index.astro` |
| Hlavička, patička, `<head>`, SEO | `src/layouts/Base.astro` |
| Strukturovaná data (služba, ceník, znalec, dotazy) | `src/data/seo.ts` – skládá se ze `site.ts` |
| Shrnutí webu pro jazykové modely | `src/pages/llms.txt.ts` → `/llms.txt`, také ze `site.ts` |
| Plán Těšína v pozadí úvodu | `src/assets/mapa-tesin.svg`, vyrábí ho `node scripts/mapa-tesina.mjs` |
| Fotka v úvodu nebo zástupná silueta | `src/components/Portret.astro`, fotka `src/assets/portret.jpg` (výřez vyrábí `node scripts/portret.mjs`) |
| Formulář | `src/components/Formular.astro`, `src/scripts/formular.ts` |
| Odeslání poptávky e-mailem (Vercel funkce) | `api/poptavka.ts` |
| Barvy, písma, rozložení | `src/styles/global.css` |
| Bezpečnostní hlavičky, CSP | `vercel.json` |
| Náhledový obrázek a ikony | `bash scripts/generate-assets.sh` (zdroje ve `scripts/assets/`) |

## Konvence

- **Fakta nevymýšlet.** Co je v `src/data/site.ts` označené `OVĚŘENO`, pochází ze seznamu znalců
  Ministerstva spravedlnosti. Praxi, počty posudků, reference, lhůty ani ceny nedomýšlej. Nový text
  nebo číslo označ `NÁVRH` a řekni uživateli, že ho má potvrdit pan Suchanek.
- **Málo textu.** Jednořádkové popisy, žádné odstavce navíc. Spíš ubírat než přidávat.
- **„Soudní znalec“:** úředně je to jen „znalec“, lidé ale hledají „soudní znalec“. Proto je to
  slovo v titulku, popisu, hlavičce a strukturovaných datech. Úřední údaje o zápisu (`zapis`
  v `site.ts`) jdou jen do strukturovaných dat a `llms.txt`, na stránku ne.
- **Úvod jen s tím podstatným:** jméno, co dělá a kde, dvě tlačítka, fotka. Žádné úřední údaje
  (datum zápisu, přesný obor), žádná karta s tabulkou a nikde nahoře adresa – zákazníka to nezajímá.
- **Kontakt na jedno kliknutí.** Tlačítko v hlavičce vede na `#kontakt`, telefon je klikací všude.
  Nepřidávej nic, co návštěvníka odvádí pryč (bannery, vyskakovací okna, odkazy ven mimo seznam znalců).
- **Vizuál: modrá výkresu, bílý papír, jedna zlatá.** Zlatá patří jen hlavnímu tlačítku. Barvy
  výhradně přes tokeny v `:root`. Nadpisy Besley, text Libre Franklin. Žádné další barvy, ikony
  ani animace.
- **Plán v úvodu** je skutečné centrum Českého Těšína z dat OpenStreetMap, natočené o 30°, aby Olše
  běžela podél pravého okraje. Je to jen pozadí: nic se na něm nevyznačuje, žádná adresa ani konkrétní
  dům. Výřez a měřítko se nastavují konstantami ve `scripts/mapa-tesina.mjs`. Odkaz na zdroj mapy
  v patičce vyžaduje licence – nemazat.
- **Fotka v úvodu** je čtvercový výřez ze snímku z předávání ocenění. Uživatel na ní chce vidět
  celou chvíli předávání (podání ruky s předávajícím), ne jen hlavu pana Suchanka. Původní snímek
  (`scripts/assets/portret-puvodni.jpeg`) je v `.gitignore` a necommituje se. Skript ho jen ořízne
  a zmenší – fotku jinak neupravuj (žádné ztmavování ani retuše, ty si uživatel dělá sám).
- **Česká typografie:** texty z dat prožeň přes `cz()` z `src/utils/cz.ts`, telefon, PSČ, datum a cenu
  přes `pevne()`. Pevnou mezeru piš konstantou `NBSP` – zápis `\u00a0` přímo ve zdrojáku se při
  ukládání nástrojem snadno změní na neviditelný znak.
- **Formulář:** `api/poptavka.ts` je záměrně soběstačný (bez importů ze `src/`). Při `npm run dev` ho
  obsluhuje plugin v `astro.config.mjs`; bez `RESEND_API_KEY` běží nanečisto a e-mail jen vypíše do
  konzole. Funguje i bez JavaScriptu (přesměruje na `/odeslano`).
- **Písma jen z vlastního webu** (`@fontsource`), žádné cizí domény – jinak je potřeba upravit CSP
  ve `vercel.json`. Web nepoužívá cookies ani měření.
- **URL bez koncového lomítka** (`trailingSlash: 'never'`, `build.format: 'file'`, ve `vercel.json`
  `cleanUrls`). Každá stránka má právě jeden H1.
