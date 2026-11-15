// Odeslání poptávky bez znovunačtení stránky. Když skript neběží, formulář se odešle klasicky.

const JE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formular = document.querySelector<HTMLFormElement>('[data-formular]');
const hotovo = document.querySelector<HTMLElement>('[data-hotovo]');

if (formular && hotovo) {
  const tlacitko = formular.querySelector<HTMLButtonElement>('[data-odeslat]')!;
  const stav = formular.querySelector<HTMLElement>('[data-stav]')!;
  const nacteno = Date.now();
  // Telefon a e-mail pro chybovou hlášku si formulář nese v data atributech (zdroj: src/data/site.ts).
  const { telefon: TELEFON = '', email: EMAIL = '' } = formular.dataset;

  const pole = (nazev: string) => formular.elements.namedItem(nazev) as HTMLInputElement | null;
  const hodnota = (nazev: string) => pole(nazev)?.value.trim() ?? '';

  const ukazChybu = (klic: string, text: string, prvky: (HTMLInputElement | null)[]) => {
    const odstavec = formular.querySelector<HTMLElement>(`[data-chyba="${klic}"]`);
    if (odstavec) {
      odstavec.textContent = text;
      odstavec.hidden = !text;
    }
    prvky.forEach((prvek) => prvek?.setAttribute('aria-invalid', text ? 'true' : 'false'));
  };

  const zkontroluj = () => {
    const jmeno = hodnota('jmeno');
    const telefon = hodnota('telefon');
    const email = hodnota('email');
    let prvniSpatne: HTMLInputElement | null = null;

    const chybaJmena = jmeno.length < 2 ? 'Napište prosím své jméno.' : '';
    ukazChybu('jmeno', chybaJmena, [pole('jmeno')]);
    if (chybaJmena) prvniSpatne = pole('jmeno');

    let chybaKontaktu = '';
    let spatnyKontakt: HTMLInputElement | null = null;
    if (!telefon && !email) {
      chybaKontaktu = 'Vyplňte prosím telefon nebo e-mail, ať se vám mohu ozvat.';
      spatnyKontakt = pole('telefon');
    } else if (telefon && telefon.replace(/\D/g, '').length < 9) {
      chybaKontaktu = 'Telefonní číslo je příliš krátké. Zkontrolujte ho prosím.';
      spatnyKontakt = pole('telefon');
    } else if (email && !JE_EMAIL.test(email)) {
      chybaKontaktu = 'E-mail nemá správný tvar. Zkontrolujte ho prosím.';
      spatnyKontakt = pole('email');
    }
    ukazChybu('kontakt', chybaKontaktu, []);
    pole('telefon')?.setAttribute('aria-invalid', String(spatnyKontakt === pole('telefon') && !!chybaKontaktu));
    pole('email')?.setAttribute('aria-invalid', String(spatnyKontakt === pole('email') && !!chybaKontaktu));
    if (chybaKontaktu && !prvniSpatne) prvniSpatne = spatnyKontakt;

    prvniSpatne?.focus();
    return !prvniSpatne;
  };

  const nastavOdesilani = (odesila: boolean) => {
    tlacitko.disabled = odesila;
    tlacitko.textContent = odesila ? tlacitko.dataset.textOdesila! : tlacitko.dataset.text!;
  };

  const ukazStav = (text: string) => {
    stav.textContent = text;
    stav.hidden = !text;
  };

  formular.addEventListener('submit', async (udalost) => {
    udalost.preventDefault();
    ukazStav('');
    if (!zkontroluj()) return;

    nastavOdesilani(true);
    try {
      const odpoved = await fetch(formular.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          jmeno: hodnota('jmeno'),
          telefon: hodnota('telefon'),
          email: hodnota('email'),
          nemovitost: hodnota('nemovitost'),
          zprava: hodnota('zprava'),
          web_adresa: hodnota('web_adresa'),
          doba: Date.now() - nacteno,
        }),
      });
      const data = (await odpoved.json().catch(() => null)) as { zprava?: string } | null;
      if (!odpoved.ok) {
        // 400 = něco je špatně vyplněné a server řekl co. Ostatní chyby jsou na naší straně.
        throw new Error(odpoved.status === 400 && data?.zprava ? data.zprava : '');
      }
      formular.hidden = true;
      hotovo.hidden = false;
      hotovo.focus();
    } catch (chyba) {
      const duvod = chyba instanceof Error ? chyba.message : '';
      ukazStav(
        duvod ||
          `Poptávku se nepodařilo odeslat. Zavolejte prosím na ${TELEFON} nebo napište na ${EMAIL}.`,
      );
      nastavOdesilani(false);
    }
  });

  // Jakmile člověk chybu opraví, hláška zmizí hned – nečeká se na další odeslání.
  formular.addEventListener('input', (udalost) => {
    const prvek = udalost.target as HTMLInputElement;
    if (prvek.getAttribute('aria-invalid') !== 'true') return;
    if (prvek.name === 'jmeno') ukazChybu('jmeno', '', [prvek]);
    else {
      ukazChybu('kontakt', '', []);
      prvek.setAttribute('aria-invalid', 'false');
    }
  });
}
