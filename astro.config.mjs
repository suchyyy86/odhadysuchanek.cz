// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

/**
 * Formulář odesílá Vercel funkce `api/poptavka.ts`. `astro dev` složku /api neobsluhuje,
 * proto ji při vývoji spouští tenhle plugin – stejný soubor, stejné chování jako na Vercelu.
 * Bez RESEND_API_KEY běží „nanečisto“: e-mail se jen vypíše do konzole dev serveru.
 */
function mistniApi() {
  return {
    name: 'mistni-api',
    apply: /** @type {const} */ ('serve'),
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      for (const klic of ['RESEND_API_KEY', 'CONTACT_EMAIL', 'CONTACT_FROM']) {
        if (env[klic] && !process.env[klic]) process.env[klic] = env[klic];
      }
      if (!process.env.RESEND_API_KEY) process.env.POPTAVKA_NANECISTO = '1';

      server.middlewares.use('/api/poptavka', async (req, res) => {
        try {
          const modul = await server.ssrLoadModule('/api/poptavka.ts');
          const obsluha = modul[req.method ?? 'GET'];
          if (typeof obsluha !== 'function') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }
          const casti = [];
          for await (const cast of req) casti.push(cast);
          const hlavicky = new Headers();
          for (const [nazev, hodnota] of Object.entries(req.headers)) {
            if (Array.isArray(hodnota)) hodnota.forEach((h) => hlavicky.append(nazev, h));
            else if (hodnota) hlavicky.set(nazev, hodnota);
          }
          const maTelo = req.method !== 'GET' && req.method !== 'HEAD';
          const request = new Request(`http://${req.headers.host}${req.originalUrl ?? req.url}`, {
            method: req.method,
            headers: hlavicky,
            body: maTelo ? Buffer.concat(casti) : undefined,
          });
          /** @type {Response} */
          const odpoved = await obsluha(request);
          res.statusCode = odpoved.status;
          odpoved.headers.forEach((hodnota, nazev) => res.setHeader(nazev, hodnota));
          res.end(Buffer.from(await odpoved.arrayBuffer()));
        } catch (chyba) {
          console.error('[api/poptavka]', chyba);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    },
  };
}

/**
 * `astro dev` posílá zmenšené obrázky (/_image) s pokynem, ať si je prohlížeč rok pamatuje,
 * a jejich adresa se při výměně fotky za stejně velkou nezmění. Prohlížeč by tak dál ukazoval
 * starou fotku. Při vývoji mu proto říkáme, ať se na obrázek pokaždé zeptá znovu.
 * Ostrého webu se to netýká: tam má každý obrázek v názvu otisk obsahu.
 */
function cerstveObrazky() {
  return {
    name: 'cerstve-obrazky',
    apply: /** @type {const} */ ('serve'),
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/_image')) {
          const puvodni = res.writeHead.bind(res);
          // Astro předává hlavičky odpovědi jako poslední argument writeHead.
          res.writeHead = /** @type {typeof res.writeHead} */ (
            (/** @type {any[]} */ ...argumenty) => {
              const hlavicky = argumenty.at(-1);
              if (hlavicky && typeof hlavicky === 'object' && !Array.isArray(hlavicky)) {
                for (const nazev of Object.keys(hlavicky)) {
                  if (nazev.toLowerCase() === 'cache-control') hlavicky[nazev] = 'no-cache';
                }
              }
              return Reflect.apply(puvodni, res, argumenty);
            }
          );
        }
        next();
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://odhadysuchanek.cz',
  // Jedna adresa na stránku: /ochrana-osobnich-udaju, ne s lomítkem ani s .html.
  // Na Vercelu to dotahuje vercel.json (cleanUrls + trailingSlash: false).
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|odeslano)\/?$/.test(page),
    }),
  ],
  vite: {
    plugins: [mistniApi(), cerstveObrazky()],
  },
});
