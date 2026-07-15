/**
 * Fill the "What This Measures" field of each Charts CMS item with a short
 * interim description (50–70 words), pending fuller editorial texts.
 *
 * Usage:  WEBFLOW_TOKEN=xxx node scripts/fill-descriptions.mjs
 */

import { DESCRIPTIONS } from '../src/descriptions.js';

const COLLECTION_ID = '6a4d026b44dd400fefd0013b';
const TOKEN = process.env.WEBFLOW_TOKEN;
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
  const { items } = await api(`/collections/${COLLECTION_ID}/items?limit=100`);
  const bySlug = Object.fromEntries(items.map(i => [i.fieldData.slug, i.id]));

  const updated = [];
  for (const [slug, text] of Object.entries(DESCRIPTIONS)) {
    const id = bySlug[slug];
    if (!id) { console.error('No item for slug', slug); continue; }
    await api(`/collections/${COLLECTION_ID}/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fieldData: { 'what-this-measures': `<p>${text}</p>` } }),
    });
    updated.push(id);
    console.log('Updated', slug);
  }

  const pub = await api(`/collections/${COLLECTION_ID}/items/publish`, {
    method: 'POST',
    body: JSON.stringify({ itemIds: updated }),
  });
  console.log(`Published ${updated.length} items. Errors: ${JSON.stringify(pub.errors || [])}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
