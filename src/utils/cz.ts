/** Pevná (nedělitelná) mezera. */
export const NBSP = '\u00a0';

/** Všechny mezery v textu nahradí pevnými – pro telefon, PSČ, datum nebo cenu. */
export const pevne = (text: string) => text.replaceAll(' ', NBSP);

// Česká typografie: za jednopísmennou předložkou nebo spojkou patří pevná mezera,
// aby nezůstala viset na konci řádku („v Českém Těšíně“, „a okolí“).
// Stejně tak se nesmí rozdělit datum („2. 7. 2004“) ani číslo s jednotkou („3 500 Kč“)
// a pomlčka nesmí začínat řádek.
export const cz = (text: string) =>
  text
    .replace(/ – /g, `${NBSP}– `)
    .replace(/(?<=^|[\s(\u00a0])([vszkaiouVSZKAIOU]) /g, `$1${NBSP}`)
    .replace(/(\d\.?) (?=\d)/g, `$1${NBSP}`)
    .replace(/(\d) (?=Kč|%|m²)/g, `$1${NBSP}`);

/** Číslo s mezerou mezi tisíci: 3500 → „3 500“. */
export const tisice = (cislo: number) => String(cislo).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
