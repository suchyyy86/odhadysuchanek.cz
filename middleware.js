export default function middleware(request) {
  const expected = process.env.PREVIEW_PASSWORD;
  let credentials = '';
  try { const auth = request.headers.get('authorization') || ''; if (auth.startsWith('Basic ')) credentials = atob(auth.slice(6)); } catch {}
  if (!expected || credentials !== 'tata:' + expected) return new Response('Pro nahled webu zadejte prihlasovaci udaje.', {status:401,headers:{'WWW-Authenticate':'Basic realm="Nahled webu", charset="UTF-8"','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
  return new Response(null,{headers:{'x-middleware-next':'1','X-Robots-Tag':'noindex, nofollow'}});
}
export const config = { matcher: '/:path*' };
