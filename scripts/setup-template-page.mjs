/**
 * Setup the Webflow "Charts" CMS template page:
 *   1. Find the template page (pages:read required)
 *   2. Register + apply the embed scripts (custom_code:write required)
 *   3. Publish the site
 *
 * Usage:  WEBFLOW_TOKEN=xxx node scripts/setup-template-page.mjs
 *
 * Note: the Custom Code API only accepts JavaScript (registered scripts),
 * not raw HTML. The bundle (since the /charts/<slug> path-fallback commit)
 * derives the chart id from the URL, so no per-page inline binding is
 * needed — one bootstrap script creates the .ocm-embed div and loads the
 * bundle on every /charts/* page.
 */

const SITE_ID       = '688e6d7092aabedfae99d3ff';
const COLLECTION_ID = '6a4d026b44dd400fefd0013b';
const BUNDLE_URL    = 'https://mariusoffchain.github.io/offchain-data-js/dist/offchain-data.bundle.js';
const TOKEN         = process.env.WEBFLOW_TOKEN;

if (!TOKEN) { console.error('Set WEBFLOW_TOKEN'); process.exit(1); }

const api = async (path, opts = {}) => {
  const res = await fetch(`https://api.webflow.com/v2${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} → ${res.status}: ${JSON.stringify(body)}`);
  return body;
};

// Bootstrap: only acts on /charts/<slug> pages. Creates the embed div at the
// top of the page body and loads the bundle, which picks up the slug itself.
const BOOTSTRAP = `(function(){if(!/^\\/charts\\/[a-z0-9-]+\\/?$/.test(location.pathname))return;function go(){var t=document.querySelector('.ocm-embed');if(!t){t=document.createElement('div');t.className='ocm-embed';t.style.cssText='width:100%;min-height:460px;max-width:1100px;margin:0 auto;padding:24px 16px 8px';var m=document.querySelector('main')||document.body;m.insertBefore(t,m.firstChild);}var s=document.createElement('script');s.src='${BUNDLE_URL}';s.defer=true;document.head.appendChild(s);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();`;

async function main() {
  // ── 1. Find the Charts template page ────────────────────────────────
  const { pages } = await api(`/sites/${SITE_ID}/pages?limit=100`);
  const template = pages.find(p => p.collectionId === COLLECTION_ID);
  if (!template) {
    console.error('No template page found for collection', COLLECTION_ID);
    console.error('Pages seen:', pages.map(p => `${p.title} (${p.slug}) collectionId=${p.collectionId || '-'}`).join('\n'));
    process.exit(1);
  }
  console.log(`Template page: "${template.title}" id=${template.id} slug=${template.slug}`);

  // ── 2. Register the bootstrap as an inline script (idempotent) ──────
  const { registeredScripts = [] } = await api(`/sites/${SITE_ID}/registered_scripts`);
  let script = registeredScripts.find(s => s.displayName === 'OCM Charts Embed');
  if (!script) {
    script = await api(`/sites/${SITE_ID}/registered_scripts/inline`, {
      method: 'POST',
      body: JSON.stringify({
        sourceCode: BOOTSTRAP,
        displayName: 'OCM Charts Embed',
        version: '1.0.0',
      }),
    });
    console.log('Registered inline script:', script.id, script.version);
  } else {
    console.log('Inline script already registered:', script.id, script.version);
  }

  // ── 3. Apply it to the template page ────────────────────────────────
  const applied = await api(`/pages/${template.id}/custom_code`, {
    method: 'PUT',
    body: JSON.stringify({
      scripts: [{ id: script.id, location: 'footer', version: script.version }],
    }),
  });
  console.log('Applied to page:', JSON.stringify(applied));

  // ── 4. Publish the site ──────────────────────────────────────────────
  const site = await api(`/sites/${SITE_ID}`);
  const domains = (site.customDomains || []).map(d => d.id);
  const pub = await api(`/sites/${SITE_ID}/publish`, {
    method: 'POST',
    body: JSON.stringify({ publishToWebflowSubdomain: true, ...(domains.length ? { customDomains: domains } : {}) }),
  });
  console.log('Published:', JSON.stringify(pub));
  console.log('\nDone — test: https://offchain.media/charts/btc-price');
}

main().catch(e => { console.error(e.message); process.exit(1); });
