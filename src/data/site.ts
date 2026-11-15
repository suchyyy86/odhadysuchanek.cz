// Veškerý obsah webu na jednom místě.
//
// OVĚŘENO = údaj z veřejného seznamu znalců Ministerstva spravedlnosti (seznat.justice.cz, 15. 11. 2026)
//           nebo z přehledu Komory soudních znalců ČR.
// NÁVRH   = pracovní text nebo číslo, které je potřeba potvrdit s panem Suchankem, než web půjde ven.

import { tisice } from '../utils/cz';

export const web = {
  url: 'https://odhadysuchanek.cz',
  // Úředně je to „znalec“, lidé ale hledají „soudní znalec“ – proto je v titulku, popisu a hlavičce.
  titulek: 'Odhady nemovitostí Český Těšín – soudní znalec Ing. Suchanek',
  popis:
    'Soudní znalec Ing. Bohdan Suchanek: znalecké posudky a odhady nemovitostí v Českém Těšíně a okolí. Byty, domy a pozemky pro dědictví, prodej, rozvod i soud.',
  /** Řádek pod jménem v hlavičce. */
  podtitul: 'soudní znalec, odhady nemovitostí',
};

// OVĚŘENO – seznam znalců Ministerstva spravedlnosti, záznam č. 3705.
export const znalec = {
  jmeno: 'Ing. Bohdan Suchanek',
  titul: 'Ing.',
  jmenoBezTitulu: 'Bohdan Suchanek',
  telefon: '728 135 767',
  telefonOdkaz: 'tel:+420728135767',
  email: 'bohdans@volny.cz',
  ulice: 'Frýdecká 1350/52',
  psc: '737 01',
  mesto: 'Český Těšín',
  ico: '65468457',
  datovaSchranka: 'dpstvpd',
  seznamZnalcu: 'https://seznat.justice.cz/znalec/detail/3705',
};

// OVĚŘENO – úřední údaje o zápisu. Na stránce se neukazují (zákazníka nezajímají); slouží jen
// strojům: strukturovaným datům (src/data/seo.ts) a souboru llms.txt.
export const zapis = {
  den: '2004-07-02',
  rok: '2004',
  obor: 'Ekonomika',
  odvetvi: 'Oceňování nemovitých věcí',
  specializace: 'Určování hodnoty lesních pozemků',
  eviduje: 'Ministerstvo spravedlnosti České republiky',
};

// NÁVRH – výčet obcí, kam pan Suchanek běžně jezdí.
export const pusobnost = {
  obce: ['Český Těšín', 'Třinec', 'Karviná', 'Havířov', 'Jablunkov', 'Frýdek-Místek'],
};

// V úvodu jen to podstatné: kdo, co a kde. Žádné úřední údaje (datum zápisu, obor) ani adresa.
export const uvod = {
  role: 'odhady nemovitostí a znalecké posudky',
  // NÁVRH – formulace.
  text: 'Oceňuji byty, domy a pozemky v Českém Těšíně a okolí – pro dědictví, prodej, rozvod i soud.',
  tlacitko: 'Poslat nezávaznou poptávku',
};

// NÁVRH – texty. Odvětví „Oceňování nemovitých věcí“ a specializace na lesní pozemky jsou OVĚŘENY.
export const sluzby = {
  nadpis: 'S čím vám pomohu',
  text: 'Vypracuji znalecký posudek nebo odhad ceny nemovitosti – bytu, rodinného domu, chaty, garáže, pozemku i lesa.',
  situace: [
    { nazev: 'Dědictví', popis: 'Ocenění nemovitosti pro notáře v řízení o pozůstalosti.' },
    { nazev: 'Prodej a koupě', popis: 'Obvyklá cena, o kterou se můžete opřít při jednání.' },
    { nazev: 'Rozvod a spoluvlastnictví', popis: 'Podklad pro vypořádání společného jmění nebo podílů.' },
    { nazev: 'Darování a daně', popis: 'Ocenění pro převod v rodině a pro daňové přiznání.' },
    { nazev: 'Soud, exekuce a insolvence', popis: 'Znalecký posudek pro soudní a úřední řízení.' },
  ],
};

export const proc = {
  nadpis: 'Proč se obrátit na mě',
  duvody: [
    {
      // OVĚŘENO
      nazev: 'Znalcem od roku 2004',
      popis: 'V seznamu znalců Ministerstva spravedlnosti jsem zapsán od 2. 7. 2004 pro oceňování nemovitých věcí.',
      odkaz: { text: 'Ověřit zápis v seznamu znalců', url: znalec.seznamZnalcu },
    },
    {
      // Obecně platné pro znalecké posudky.
      nazev: 'Posudek, který úřady přijmou',
      popis: 'Znalecký posudek s doložkou a pečetí uznávají soudy, notáři i finanční úřad.',
    },
    {
      // NÁVRH
      nazev: 'Jednáte přímo se mnou',
      popis: 'Nemovitost si prohlédnu a posudek zpracuji osobně. Sídlím v Českém Těšíně.',
    },
    {
      // OVĚŘENO – specializace „Určování hodnoty lesních pozemků“.
      nazev: 'Oceňuji i lesní pozemky',
      popis: 'Na určování hodnoty lesních pozemků mám znaleckou specializaci.',
    },
  ],
};

// NÁVRH – postup potvrdit. Lhůta (do dvou týdnů, při spěchu po dohodě) je zadaná, ne návrh.
export const prubeh = {
  nadpis: 'Jak spolupráce probíhá',
  kroky: [
    {
      nazev: 'Ozvete se',
      popis: 'Řeknete mi, o jakou nemovitost jde a k čemu ocenění potřebujete. Sdělím vám cenu a termín.',
    },
    {
      nazev: 'Prohlídka',
      popis: 'Přijedu na místo, nemovitost zaměřím a vyfotím. Většinou to trvá do hodiny.',
    },
    {
      nazev: 'Posudek',
      popis: 'Zpracuji ho zpravidla do dvou týdnů od prohlídky. Pokud spěcháte, domluvíme se na dřívějším termínu.',
    },
    { nazev: 'Předání', popis: 'Tištěný posudek s pečetí vám předám osobně nebo pošlu poštou.' },
  ],
};

// NÁVRH – částky vycházejí z ceníků znalců a odhadců v okolí (Třinec, Ostrava) a z celostátních ceníků,
// nejsou to ceny pana Suchanka. Před spuštěním webu je potřeba je s ním projít.
export const cenik = {
  // Slovo „orientační“ nese poznámka pod tabulkou; nadpis říká, co v ceníku je.
  nadpis: 'Ceník odhadů a znaleckých posudků',
  // „od“ je částka v korunách. Položka bez částky se ukáže s textem `individualne`.
  polozky: [
    { nazev: 'Byt', od: 3500 },
    { nazev: 'Rodinný dům', od: 5500 },
    { nazev: 'Chata, chalupa', od: 4500 },
    { nazev: 'Garáž', od: 2500 },
    { nazev: 'Pozemek', od: 2500 },
    { nazev: 'Lesní pozemek' },
    { nazev: 'Bytový dům a jiné stavby' },
  ] as { nazev: string; od?: number }[],
  individualne: 'podle rozsahu',
  poznamka:
    'Ceny jsou orientační. Přesnou částku vám řeknu předem – záleží na typu nemovitosti, jejím rozsahu a účelu ocenění.',
  odkaz: 'Zeptat se na přesnou cenu',
};

/** Cena položky tak, jak se ukazuje na webu: „od 3 500 Kč“, nebo „podle rozsahu“. */
export const cenaPolozky = (polozka: { od?: number }) =>
  polozka.od ? `od ${tisice(polozka.od)} Kč` : cenik.individualne;

// NÁVRH – odpovědi potvrdit (hlavně výčet obcí). Lhůta do dvou týdnů je zadaná, ne návrh.
export const dotazy = {
  nadpis: 'Časté dotazy',
  seznam: [
    {
      otazka: 'Jaký je rozdíl mezi odhadem a znaleckým posudkem?',
      odpoved:
        'Odhad je orientační stanovení ceny, které se hodí třeba při prodeji. Znalecký posudek smí vypracovat jen znalec zapsaný v seznamu Ministerstva spravedlnosti (lidově soudní znalec), má předepsané náležitosti a přijímají ho soudy, notáři i úřady. Když si nejste jistí, co potřebujete, zavolejte – poradím vám.',
    },
    {
      otazka: 'Jak dlouho zpracování trvá?',
      odpoved:
        'Zpravidla do dvou týdnů od prohlídky nemovitosti. Pokud spěcháte, řekněte mi to hned na začátku – domluvíme se na dřívějším termínu.',
    },
    {
      // NÁVRH – půl roku je běžně uváděná praxe, potvrdit s panem Suchankem.
      otazka: 'Jak dlouho posudek platí?',
      odpoved:
        'Posudek stanovuje cenu k určitému dni, pevnou dobu platnosti nemá. V praxi se s ním ale počítá zhruba půl roku, pak už se ceny na trhu mohou lišit.',
    },
    {
      otazka: 'Co si mám připravit?',
      odpoved:
        'Stačí adresa nebo číslo parcely. Pomůže list vlastnictví, kupní nebo darovací smlouva, projektová dokumentace či půdorys a přehled větších oprav. U dědictví také datum úmrtí – cena se stanovuje k tomuto dni.',
    },
    {
      otazka: 'Musím být u prohlídky?',
      odpoved: 'Je potřeba, aby mi někdo nemovitost zpřístupnil. Nemusíte to být vy, stačí osoba, kterou pověříte.',
    },
    {
      otazka: 'Lze posudek použít pro hypotéku?',
      odpoved:
        'Banky většinou vyžadují odhad od svého smluvního odhadce. Předem si proto u banky ověřte, jaké ocenění přijme.',
    },
    {
      otazka: 'Kde všude působíte?',
      odpoved:
        'V Českém Těšíně a okolí – například v Třinci, Karviné, Havířově, Jablunkově a Frýdku-Místku. Po domluvě i jinde v Moravskoslezském kraji.',
    },
  ],
};

export const kontakt = {
  nadpis: 'Napište nebo zavolejte',
  text: 'Popište mi krátce, co potřebujete ocenit. Ozvu se vám zpět.',
  formular: {
    nadpis: 'Nezávazná poptávka',
    nemovitosti: ['Byt', 'Rodinný dům', 'Chata nebo chalupa', 'Garáž', 'Pozemek', 'Lesní pozemek', 'Jiné'],
    odeslat: 'Odeslat poptávku',
    odesila: 'Odesílám…',
    hotovoNadpis: 'Poptávka odeslána',
    hotovoText: 'Děkuji. Ozvu se vám co nejdříve.',
  },
};
