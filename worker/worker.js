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

// Live endpoints (current mempool / latest blocks) change every few
// seconds; everything else is historical series that only gain one
// point per day/block — cache those hard at the edge so visitors never
// wait on mempool.space (2-10s on the big series when uncached).
const LIVE_PATHS = [
  '/api/v1/fees/mempool-blocks',
  '/api/v1/blocks',
  '/api/blocks',
];
const LIVE_TTL    = 60;     // 1 min at the edge
const HISTORY_TTL = 21600;  // 6 h at the edge

function edgeTtl(pathname) {
  return LIVE_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
    ? LIVE_TTL
    : HISTORY_TTL;
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not found', { status: 404 });
    }
    const ttl = edgeTtl(url.pathname);
    const r = await fetch('https://mempool.space' + url.pathname + url.search, {
      headers: { 'User-Agent': 'offchain-media/1.0' },
      cf: { cacheTtl: ttl, cacheEverything: true },
    });
    return new Response(r.body, {
      status: r.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin(req),
        // Browser cache: short for live data, 30 min for history
        // (the client-side localStorage layer handles longer reuse).
        'Cache-Control': ttl === LIVE_TTL
          ? 'public, max-age=60'
          : 'public, max-age=1800',
      },
    });
  },
};
