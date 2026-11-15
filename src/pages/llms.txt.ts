// /llms.txt – stručné shrnutí webu pro jazykové modely (ChatGPT, Claude, Gemini a další).
// Skládá se z obsahu v site.ts, takže se s webem mění samo. Formát podle llmstxt.org:
// nadpis, shrnutí a seznam odkazů. Adresy se píšou jako odkazy v Markdownu ([text](adresa)) –
// holou adresu nástroje za odkaz nepočítají (hlídá to i Lighthouse).
import type { APIRoute } from 'astro';
import { web, znalec, zapis, pusobnost, uvod, sluzby, prubeh, cenik, cenaPolozky, dotazy } from '../data/site';

export const GET: APIRoute = () => {
  const adresa = `${znalec.ulice}, ${znalec.psc} ${znalec.mesto}`;
  const obce = pusobnost.obce.join(', ');
  const odkaz = (text: string, adresa: string) => `[${text}](${adresa})`;

  const text = [
    `# ${znalec.jmeno} – ${uvod.role}`,
    '',
    `> Soudní znalec z Českého Těšína. ${uvod.text}`,
    '',
    `- Web: ${odkaz('odhadysuchanek.cz', web.url)}`,
    `- Telefon: ${odkaz(`+420 ${znalec.telefon}`, znalec.telefonOdkaz)}`,
    `- E-mail: ${odkaz(znalec.email, `mailto:${znalec.email}`)}`,
    `- Kde působí: ${obce} a okolí (Moravskoslezský kraj)`,
    '',
    '## Stránky webu',
    '',
    `- ${odkaz('Úvodní stránka', `${web.url}/`)}: služby, ceník, průběh spolupráce, časté dotazy a kontakt`,
    `- ${odkaz(cenik.nadpis, `${web.url}/#cenik`)}: orientační ceny podle typu nemovitosti`,
    `- ${odkaz(dotazy.nadpis, `${web.url}/#dotazy`)}: odpovědi na nejčastější otázky`,
    `- ${odkaz('Kontakt a poptávkový formulář', `${web.url}/#kontakt`)}: telefon, e-mail a nezávazná poptávka`,
    `- ${odkaz('Zpracování osobních údajů', `${web.url}/ochrana-osobnich-udaju`)}: jak se nakládá s údaji z formuláře`,
    `- ${odkaz('Zápis v seznamu znalců', znalec.seznamZnalcu)}: úřední ověření oprávnění, seznam vede ${zapis.eviduje}`,
    '',
    '## Kdo je Ing. Bohdan Suchanek',
    '',
    `Znalec (lidově soudní znalec) zapsaný od roku ${zapis.rok} v seznamu znalců, který vede ${zapis.eviduje}. ` +
      `Obor ${zapis.obor}, odvětví ${zapis.odvetvi}, specializace ${zapis.specializace}. ` +
      `Sídlí v Českém Těšíně. Zápis lze ověřit v ${odkaz('seznamu znalců', znalec.seznamZnalcu)}.`,
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
    `- Telefon: ${odkaz(`+420 ${znalec.telefon}`, znalec.telefonOdkaz)}`,
    `- E-mail: ${odkaz(znalec.email, `mailto:${znalec.email}`)}`,
    `- Poptávkový formulář: ${odkaz('odhadysuchanek.cz/#kontakt', `${web.url}/#kontakt`)}`,
    '',
  ].join('\n');

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
