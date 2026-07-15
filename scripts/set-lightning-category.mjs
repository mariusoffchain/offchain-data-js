/**
 * Set category = "Lightning" on the 6 Lightning chart items, then publish them.
 * Prerequisite: the "Lightning" option must exist on the Category field —
 * the public API cannot add Option choices, so add it in the Designer first
 * (Charts collection → Category field → add option "Lightning").
 *
 * Usage:  WEBFLOW_TOKEN=xxx node scripts/set-lightning-category.mjs
 */

const COLLECTION_ID = '6a4d026b44dd400fefd0013b';
const FIELD_ID      = '3c3ab51e3af4185fd153ef0f1cf9b1ed';
const TOKEN         = process.env.WEBFLOW_TOKEN;

const ITEMS = {
  'lightning-nodes':       '6a57beefadb63117b09caccc',
  'lightning-channels':    '6a57bef06d7c7d57546b8565',
  'lightning-capacity':    '6a57bef1d99f212983d41669',
  'lightning-avg-channel': '6a57bef27fc28ebf801ef0df',
  'lightning-countries':   '6a57bef290c3ffa901857ad9',
  'lightning-isp':         '6a57bef37fc28ebf801ef278',
};

if (!TOKEN) { console.error('Set WEBFLOW_TOKEN'); process.exit(1); }

const api = async (path, opts = {}) => {
  const res = await fetch(`https://api.webflow.com/v2${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} → ${res.status}: ${JSON.stringify(body)}`);
  return body;
};

async function main() {
  const coll = await api(`/collections/${COLLECTION_ID}`);
  const field = coll.fields.find(f => f.id === FIELD_ID);
  const opt = field?.validations?.options?.find(o => o.name === 'Lightning');
  if (!opt) {
    console.error('The "Lightning" option does not exist yet on the Category field.');
    console.error('Add it in the Webflow Designer first, then re-run this script.');
    process.exit(1);
  }
  console.log('Lightning option id:', opt.id);

  for (const [slug, itemId] of Object.entries(ITEMS)) {
    await api(`/collections/${COLLECTION_ID}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fieldData: { category: opt.id } }),
    });
    console.log('Updated', slug);
  }

  const pub = await api(`/collections/${COLLECTION_ID}/items/publish`, {
    method: 'POST',
    body: JSON.stringify({ itemIds: Object.values(ITEMS) }),
  });
  console.log('Published items:', JSON.stringify(pub));
}

main().catch(e => { console.error(e.message); process.exit(1); });
