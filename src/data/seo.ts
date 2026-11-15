// Strukturovaná data (JSON-LD) pro vyhledávače a jazykové modely.
// Skládají se z obsahu v site.ts, takže se mění s ním – ceník, dotazy ani kontakty tu nejsou podruhé.
import { web, znalec, zapis, pusobnost, uvod, cenik, dotazy } from './site';
import { tisice } from '../utils/cz';

const id = (kotva: string) => `${web.url}/#${kotva}`;
const nahled = `${web.url}/og.png`;
const obce = pusobnost.obce.map((obec) => ({ '@type': 'City', name: obec }));
const nejnizsiCena = Math.min(...cenik.polozky.flatMap((polozka) => (polozka.od ? [polozka.od] : [])));

export const schemaUvodu = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': id('web'),
      url: web.url,
      name: znalec.jmeno,
      alternateName: 'odhadysuchanek.cz',
      inLanguage: 'cs',
      publisher: { '@id': id('firma') },
    },
    {
      '@type': 'WebPage',
      '@id': id('stranka'),
      url: web.url,
      name: web.titulek,
      description: web.popis,
      inLanguage: 'cs',
      isPartOf: { '@id': id('web') },
      about: { '@id': id('firma') },
      primaryImageOfPage: nahled,
    },
    {
      // Místní služba: kontakty, kde působí a kolik co stojí.
      '@type': 'ProfessionalService',
      '@id': id('firma'),
      name: `${znalec.jmeno} – ${uvod.role}`,
      description: web.popis,
      url: web.url,
      image: nahled,
      telephone: '+420728135767',
      email: znalec.email,
      identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: znalec.ico },
      priceRange: `od ${tisice(nejnizsiCena)} Kč`,
      currenciesAccepted: 'CZK',
      address: {
        '@type': 'PostalAddress',
        streetAddress: znalec.ulice,
        addressLocality: znalec.mesto,
        postalCode: znalec.psc,
        addressRegion: 'Moravskoslezský kraj',
        addressCountry: 'CZ',
      },
      areaServed: obce,
      founder: { '@id': id('znalec') },
      // Sem později přidat adresu firemního profilu na Googlu a zápisu na Firmy.cz.
      sameAs: [znalec.seznamZnalcu],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: cenik.nadpis,
        itemListElement: cenik.polozky.map((polozka) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `Ocenění nemovitosti: ${polozka.nazev.toLowerCase()}`,
            serviceType: 'Znalecký posudek a odhad ceny nemovitosti',
            provider: { '@id': id('firma') },
            areaServed: obce,
          },
          ...(polozka.od
            ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: polozka.od, priceCurrency: 'CZK' } }
            : {}),
        })),
      },
    },
    {
      // Znalec jako osoba a jeho oprávnění (ověřitelné v seznamu znalců).
      '@type': 'Person',
      '@id': id('znalec'),
      name: znalec.jmenoBezTitulu,
      honorificPrefix: znalec.titul,
      jobTitle: 'Soudní znalec',
      worksFor: { '@id': id('firma') },
      knowsAbout: ['oceňování nemovitostí', 'znalecké posudky', 'odhady nemovitostí', 'oceňování lesních pozemků'],
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Znalec zapsaný v seznamu znalců',
        credentialCategory: 'znalecké oprávnění',
        competencyRequired: `Obor ${zapis.obor}, odvětví ${zapis.odvetvi}; specializace ${zapis.specializace}`,
        dateCreated: zapis.den,
        recognizedBy: { '@type': 'GovernmentOrganization', name: zapis.eviduje },
        url: znalec.seznamZnalcu,
      },
      sameAs: [znalec.seznamZnalcu],
    },
    {
      '@type': 'FAQPage',
      '@id': id('dotazy'),
      url: `${web.url}/#dotazy`,
      inLanguage: 'cs',
      isPartOf: { '@id': id('stranka') },
      mainEntity: dotazy.seznam.map((dotaz) => ({
        '@type': 'Question',
        name: dotaz.otazka,
        acceptedAnswer: { '@type': 'Answer', text: dotaz.odpoved },
      })),
    },
  ],
};
