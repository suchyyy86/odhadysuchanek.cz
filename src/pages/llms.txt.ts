// /llms.txt – stručné shrnutí webu pro jazykové modely (ChatGPT, Claude, Gemini a další).
// Skládá se z obsahu v site.ts, takže se s webem mění samo. Formát podle llmstxt.org.
import type { APIRoute } from 'astro';
import { web, znalec, zapis, pusobnost, uvod, sluzby, prubeh, cenik, cenaPolozky, dotazy } from '../data/site';

export const GET: APIRoute = () => {
  const adresa = `${znalec.ulice}, ${znalec.psc} ${znalec.mesto}`;
  const obce = pusobnost.obce.join(', ');

  const text = [
    `# ${znalec.jmeno} – ${uvod.role}`,
    '',
    `> Soudní znalec z Českého Těšína. ${uvod.text}`,
    '',
    `- Web: ${web.url}`,
    `- Telefon: +420 ${znalec.telefon}`,
    `- E-mail: ${znalec.email}`,
    `- Kde působí: ${obce} a okolí (Moravskoslezský kraj)`,
    '',
    '## Kdo je Ing. Bohdan Suchanek',
    '',
    `Znalec (lidově soudní znalec) zapsaný od roku ${zapis.rok} v seznamu znalců, který vede ${zapis.eviduje}. ` +
      `Obor ${zapis.obor}, odvětví ${zapis.odvetvi}, specializace ${zapis.specializace}. ` +
      `Sídlí v Českém Těšíně. Zápis lze ověřit: ${znalec.seznamZnalcu}`,
    '',
    '## Služby',
    '',
    sluzby.text,
    '',
    ...sluzby.situace.map((situace) => `- ${situace.nazev}: ${situace.popis}`),
    '',
    `## ${cenik.nadpis}`,
    '',
    ...cenik.polozky.map((polozka) => `- ${polozka.nazev}: ${cenaPolozky(polozka)}`),
    '',
    cenik.poznamka,
    '',
    `## ${prubeh.nadpis}`,
    '',
    ...prubeh.kroky.map((krok, i) => `${i + 1}. ${krok.nazev}: ${krok.popis}`),
    '',
    `## ${dotazy.nadpis}`,
    '',
    ...dotazy.seznam.flatMap((dotaz) => [`### ${dotaz.otazka}`, '', dotaz.odpoved, '']),
    '## Kontakt',
    '',
    `${znalec.jmeno}, ${adresa}, IČO ${znalec.ico}`,
    '',
    `- Telefon: +420 ${znalec.telefon}`,
    `- E-mail: ${znalec.email}`,
    `- Poptávkový formulář: ${web.url}/#kontakt`,
    '',
  ].join('\n');

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
