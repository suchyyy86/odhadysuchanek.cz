#!/usr/bin/env node
// Vyrobí src/assets/portret.jpg – fotku do úvodu – z původního snímku z předávání ocenění.
//
//   node scripts/portret.mjs
//
// Ze snímku na šířku vyřízne čtverec jako rámeček v úvodu (pan Suchanek si podává ruku
// s předávajícím) a zmenší ho. Nic jiného se na fotce nemění.
//
// Původní snímek patří do scripts/assets/portret-puvodni.jpeg a do gitu se neukládá – na web jde
// jen zmenšený výřez. Knihovna sharp se instaluje spolu s Astrem.
//
// Fotku, která se nemusí ořezávat, stačí uložit rovnou jako src/assets/portret.jpg – rámeček
// v úvodu si ji ořízne na čtverec sám a tenhle skript není potřeba.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZDROJ = path.join(KOREN, 'scripts', 'assets', 'portret-puvodni.jpeg');
const VYSTUP = path.join(KOREN, 'src', 'assets', 'portret.jpg');

/** Výřez v pixelech původního snímku (2400 × 1792): čtverec přes celou výšku. Vlevo předávající,
    vpravo pan Suchanek i s celou paží a kouskem pozadí za ní, dole uprostřed podání ruky. */
const VYREZ = { left: 333, top: 0, width: 1792, height: 1792 };
/** Na jakou šířku se výřez zmenší. Na webu se fotka ukazuje nejvýš 416 px široká, s rezervou
    pro jemné displeje stačí 1280. */
const SIRKA = 1280;

if (!fs.existsSync(ZDROJ)) {
  console.error(`Chybí původní snímek: ${path.relative(KOREN, ZDROJ)}`);
  process.exit(1);
}

const { width, height, size } = await sharp(ZDROJ)
  .extract(VYREZ)
  .resize({ width: Math.min(SIRKA, VYREZ.width) })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(VYSTUP);

console.log(`${path.relative(KOREN, VYSTUP)}: ${width} × ${height} px, ${Math.round(size / 1024)} kB`);
