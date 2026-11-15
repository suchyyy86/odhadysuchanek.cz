// Vercel funkce: přijme poptávku z webu a pošle ji e-mailem přes Resend (stejný vzor jako zonetic.cz).
//
// Proměnné prostředí (Vercel → Settings → Environment Variables, lokálně soubor .env):
//   RESEND_API_KEY  klíč z resend.com
//   CONTACT_EMAIL   adresa, na kterou mají poptávky chodit
//   CONTACT_FROM    odesílatel, např. „Web odhadysuchanek.cz <poptavka@odhadysuchanek.cz>“
//                   (doména musí být v Resendu ověřená)
//
// Soubor je záměrně soběstačný – bez importů z src/, aby ho Vercel sestavil bez překvapení.
// Při vývoji ho spouští plugin v astro.config.mjs; bez klíče běží nanečisto a e-mail jen vypíše.
//
// Ochrana proti zneužití: příjemce je pevně daný, poptávku přijmeme jen ze stránky na stejné
// adrese, roboty chytá skryté pole a měření času a všechna pole se zkracují a čistí. Počet
// odeslání z jedné adresy hlídá pravidlo ve Firewallu na Vercelu, ne tento soubor.

type Poptavka = {
  jmeno: string;
  telefon: string;
  email: string;
  nemovitost: string;
  zprava: string;
};

const JE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEJVETSI_TELO = 20_000;
const NEDORUCENO = 'Poptávku se nepodařilo odeslat.';

const text = (hodnota: unknown, nejvic: number) =>
  typeof hodnota === 'string' ? hodnota.trim().slice(0, nejvic) : '';

/** Jednořádkové pole: zalomení a jiné řídicí znaky do jména, telefonu ani e-mailu nepatří
    a nesmějí se dostat do předmětu zprávy. Nahradí je mezera. */
const radek = (hodnota: unknown, nejvic: number) =>
  text(typeof hodnota === 'string' ? hodnota.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, ' ') : hodnota, nejvic);

/**
 * Přišel požadavek z jiné stránky než z našeho webu? Prohlížeč to u odeslání formuláře hlásí
 * hlavičkami Sec-Fetch-Site a Origin. Když chybějí (starší prohlížeč, doplněk na ochranu soukromí),
 * necháme požadavek projít: ztratit skutečnou poptávku je horší než pustit robota, na toho jsou
 * další pasti níže.
 */
function jeOdjinud(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return true;
  const puvod = request.headers.get('origin');
  if (!puvod || puvod === 'null') return false;
  const tady = [request.headers.get('x-forwarded-host'), request.headers.get('host')];
  try {
    return !tady.includes(new URL(puvod).host);
  } catch {
    return true;
  }
}

const doHtml = (hodnota: string) =>
  hodnota
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/** Odpověď podle toho, kdo se ptá: skript na stránce dostane JSON, klasicky odeslaný formulář stránku. */
function odpovez(klasicky: boolean, stav: number, zprava?: string): Response {
  if (!klasicky) {
    return Response.json(stav < 400 ? { ok: true } : { zprava }, { status: stav });
  }
  if (stav < 400) {
    return new Response(null, { status: 303, headers: { Location: '/odeslano' } });
  }
  const stranka = `<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Poptávka nebyla odeslána</title><body style="font:18px/1.6 system-ui,sans-serif;max-width:34rem;margin:15vh auto;padding:0 1.25rem;color:#13273f"><h1 style="font-size:1.6rem">Poptávka nebyla odeslána</h1><p>${doHtml(zprava ?? NEDORUCENO)}</p><p><a href="/#kontakt" style="color:#1d4c84">Zpět na kontakt</a></p></body></html>`;
  return new Response(stranka, { status: stav, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function POST(request: Request): Promise<Response> {
  // Bez JavaScriptu prohlížeč pošle formulář jako application/x-www-form-urlencoded.
  const klasicky = !(request.headers.get('content-type') ?? '').includes('application/json');

  if (jeOdjinud(request)) {
    return odpovez(klasicky, 403, NEDORUCENO);
  }

  if (Number(request.headers.get('content-length') ?? 0) > NEJVETSI_TELO) {
    return odpovez(klasicky, 413, 'Zpráva je příliš dlouhá. Zkraťte ji prosím.');
  }

  let data: Record<string, unknown>;
  try {
    data = klasicky ? Object.fromEntries(await request.formData()) : await request.json();
    if (!data || typeof data !== 'object') throw new Error('prázdné tělo');
  } catch {
    return odpovez(klasicky, 400, 'Poptávku se nepodařilo přečíst. Zkuste ji prosím odeslat znovu.');
  }

  // Pasti na roboty. Skryté pole vyplní jen stroj. Skript na stránce navíc vždy posílá, jak dlouho
  // byl formulář otevřený: když ten údaj chybí nebo je kratší než dvě vteřiny, neposílal to člověk.
  // Formulář odeslaný klasicky (bez skriptu) dobu nemá, tam se neposuzuje.
  // Tváříme se, že vše prošlo, ať robot nezkouší jiné cesty.
  const rychle = !klasicky && !(typeof data.doba === 'number' && data.doba >= 2000);
  if (text(data.web_adresa, 200) || rychle) {
    return odpovez(klasicky, 200);
  }

  const poptavka: Poptavka = {
    jmeno: radek(data.jmeno, 120),
    telefon: radek(data.telefon, 30),
    email: radek(data.email, 200),
    nemovitost: radek(data.nemovitost, 60),
    zprava: text(data.zprava, 4000),
  };

  if (poptavka.jmeno.length < 2) {
    return odpovez(klasicky, 400, 'Napište prosím své jméno.');
  }
  if (!poptavka.telefon && !poptavka.email) {
    return odpovez(klasicky, 400, 'Vyplňte prosím telefon nebo e-mail, ať se vám mohu ozvat.');
  }
  if (poptavka.telefon && poptavka.telefon.replace(/\D/g, '').length < 9) {
    return odpovez(klasicky, 400, 'Telefonní číslo je příliš krátké. Zkontrolujte ho prosím.');
  }
  if (poptavka.email && !JE_EMAIL.test(poptavka.email)) {
    return odpovez(klasicky, 400, 'E-mail nemá správný tvar. Zkontrolujte ho prosím.');
  }

  const radky: [string, string][] = [
    ['Jméno', poptavka.jmeno],
    ['Telefon', poptavka.telefon || '–'],
    ['E-mail', poptavka.email || '–'],
    ['Nemovitost', poptavka.nemovitost || '–'],
    ['Zpráva', poptavka.zprava || '–'],
  ];
  const predmet = `Poptávka z webu: ${poptavka.jmeno}${poptavka.nemovitost ? ` (${poptavka.nemovitost})` : ''}`;
  const jakoText = radky.map(([nazev, hodnota]) => `${nazev}: ${hodnota}`).join('\n');
  const jakoHtml = `<div style="font-family:sans-serif;max-width:600px;color:#13273f"><h2 style="margin:0 0 16px">Nová poptávka z webu odhadysuchanek.cz</h2><table style="width:100%;border-collapse:collapse">${radky
    .map(
      ([nazev, hodnota]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #d4dde8;width:28%;vertical-align:top"><strong>${nazev}</strong></td><td style="padding:8px 0;border-top:1px solid #d4dde8">${doHtml(hodnota).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')}</table></div>`;

  if (process.env.POPTAVKA_NANECISTO === '1') {
    console.log(`\n[poptávka nanečisto – e-mail se neodesílá]\n${predmet}\n${jakoText}\n`);
    return odpovez(klasicky, 200);
  }

  const klic = process.env.RESEND_API_KEY;
  const komu = process.env.CONTACT_EMAIL;
  const od = process.env.CONTACT_FROM ?? 'Web odhadysuchanek.cz <poptavka@odhadysuchanek.cz>';
  if (!klic || !komu) {
    console.error('Poptávka nedoručena: chybí RESEND_API_KEY nebo CONTACT_EMAIL.');
    return odpovez(klasicky, 503, NEDORUCENO);
  }

  try {
    const odeslani = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${klic}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: od,
        to: [komu],
        subject: predmet,
        text: jakoText,
        html: jakoHtml,
        ...(poptavka.email ? { reply_to: poptavka.email } : {}),
      }),
    });
    if (!odeslani.ok) {
      console.error('Resend odmítl e-mail:', odeslani.status, await odeslani.text());
      return odpovez(klasicky, 502, NEDORUCENO);
    }
  } catch (chyba) {
    console.error('Resend není dostupný:', chyba);
    return odpovez(klasicky, 502, NEDORUCENO);
  }

  return odpovez(klasicky, 200);
}
