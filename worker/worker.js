/**
 * Off-Chain Media — mempool.space CORS proxy
 *
 * mempool.space rejects browser requests (no CORS headers), so the
 * /data page calls this Worker instead. It forwards any /api/* path
 * to mempool.space and adds CORS headers for offchain.media.
 *
 * Deploy: see worker/README.md
 */

const ALLOWED_ORIGINS = [
  'https://offchain.media',
  'https://www.offchain.media',
];

function corsOrigin(req) {
  const origin = req.headers.get('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.endsWith('.webflow.io')) return origin; // Webflow staging/preview
  return ALLOWED_ORIGINS[0];
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not found', { status: 404 });
    }
    const r = await fetch('https://mempool.space' + url.pathname + url.search, {
      headers: { 'User-Agent': 'offchain-media/1.0' },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    return new Response(r.body, {
      status: r.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin(req),
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};
