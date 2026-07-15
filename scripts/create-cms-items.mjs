/**
 * create-cms-items.mjs
 *
 * Creates one CMS item per chart in the Webflow "data" collection.
 * Run: WEBFLOW_TOKEN=<your-token> node scripts/create-cms-items.mjs
 *
 * Get your token: Webflow → Account Settings → Integrations → API Access
 */

const SITE_ID = '688e6d7092aabedfae99d3ff';
const TOKEN   = process.env.WEBFLOW_TOKEN;
const BASE    = 'https://api.webflow.com/v2';

if (!TOKEN) {
  console.error('Error: WEBFLOW_TOKEN env variable is required.');
  console.error('Usage: WEBFLOW_TOKEN=your-token node scripts/create-cms-items.mjs');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  accept: 'application/json',
};

// All 24 charts from src/catalog.js
const CATALOG = [
  { id: 'btc-price',           title: 'Bitcoin Price',               subtitle: 'BTC/USD daily reference rate',                       category: 'market',    source: 'Coin Metrics'  },
  { id: 'market-cap',          title: 'Market Capitalization',        subtitle: 'Total BTC market value in USD',                     category: 'market',    source: 'Coin Metrics'  },
  { id: 'volume',              title: '24h Trading Volume',           subtitle: 'Aggregate exchange spot volume',                    category: 'market',    source: 'CoinGecko'     },
  { id: 'dominance',           title: 'Circulating Supply',           subtitle: 'Total BTC mined to date',                           category: 'market',    source: 'Coin Metrics'  },
  { id: 'hashrate',            title: 'Network Hashrate',             subtitle: 'Total computational power',                         category: 'mining',    source: 'mempool.space' },
  { id: 'difficulty',          title: 'Mining Difficulty',            subtitle: 'Adjusted every 2,016 blocks',                       category: 'mining',    source: 'mempool.space' },
  { id: 'block-fees',          title: 'Block Fees',                   subtitle: 'Average fees per block',                            category: 'mining',    source: 'mempool.space' },
  { id: 'hashprice',           title: 'Hash Price',                   subtitle: 'Daily revenue per TH/s',                            category: 'mining',    source: 'mempool.space' },
  { id: 'block-rewards',       title: 'Block Rewards',                subtitle: 'Average BTC earned per block (subsidy + fees)',     category: 'mining',    source: 'mempool.space' },
  { id: 'mining-pools',        title: 'Mining Pool Distribution',     subtitle: 'Share of blocks mined by pool (last 12 months)',    category: 'mining',    source: 'mempool.space' },
  { id: 'active-addresses',    title: 'Active Addresses',             subtitle: 'Unique addresses used daily',                       category: 'on-chain',  source: 'Coin Metrics'  },
  { id: 'lth-supply',          title: 'Miner Revenue',                subtitle: 'Daily BTC earned by miners (subsidy + fees)',       category: 'on-chain',  source: 'Coin Metrics'  },
  { id: 'exchange-balance',    title: 'Exchange Balances',            subtitle: 'Total BTC on exchanges',                            category: 'on-chain',  source: 'Coin Metrics'  },
  { id: 'nvt',                 title: 'Daily Transactions',           subtitle: 'On-chain transaction count per day',                category: 'on-chain',  source: 'Coin Metrics'  },
  { id: 'lightning-nodes',     title: 'Lightning Nodes',              subtitle: 'Number of public Lightning Network nodes',          category: 'lightning', source: 'mempool.space' },
  { id: 'lightning-channels',  title: 'Lightning Channels',           subtitle: 'Total open payment channels',                       category: 'lightning', source: 'mempool.space' },
  { id: 'lightning-capacity',  title: 'Lightning Capacity',           subtitle: 'Total BTC locked in the Lightning Network',         category: 'lightning', source: 'mempool.space' },
  { id: 'lightning-avg-channel', title: 'Avg Channel Size',           subtitle: 'Average BTC locked per Lightning channel',          category: 'lightning', source: 'mempool.space' },
  { id: 'lightning-countries', title: 'Nodes by Country',             subtitle: 'Top countries by public Lightning node count',      category: 'lightning', source: 'mempool.space' },
  { id: 'lightning-isp',       title: 'Nodes by ISP',                 subtitle: 'Top internet providers hosting Lightning nodes',    category: 'lightning', source: 'mempool.space' },
  { id: 'mempool-size',        title: 'Mempool Size',                 subtitle: 'Pending transactions in vBytes',                    category: 'mempool',   source: 'mempool.space' },
  { id: 'fee-rates',           title: 'Fee Rate Distribution',        subtitle: 'sat/vB by confirmation priority',                   category: 'mempool',   source: 'mempool.space' },
  { id: 'tx-per-second',       title: 'Transactions Per Second',      subtitle: 'On-chain throughput',                               category: 'mempool',   source: 'Coin Metrics'  },
  { id: 'block-weight',        title: 'Average Block Weight',         subtitle: 'How full are Bitcoin blocks?',                      category: 'mempool',   source: 'mempool.space' },
];

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function findDataCollection() {
  console.log(`\nListing collections for site ${SITE_ID}…`);
  const data = await api('GET', `/sites/${SITE_ID}/collections`);
  const collections = data.collections ?? data;
  console.log(`Found ${collections.length} collection(s):`);
  for (const c of collections) {
    console.log(`  [${c.id}] ${c.displayName || c.name} (slug: ${c.slug})`);
  }
  const col = collections.find(c =>
    (c.slug === 'charts') ||
    (c.slug === 'data') ||
    (c.displayName || c.name || '').toLowerCase().includes('chart') ||
    (c.displayName || c.name || '').toLowerCase() === 'data'
  );
  if (!col) throw new Error('No "data" collection found. Check the list above and update the slug/name check.');
  console.log(`\n✓ Using collection: "${col.displayName || col.name}" (ID: ${col.id})`);
  return col;
}

async function getCollectionFields(collectionId) {
  const col = await api('GET', `/collections/${collectionId}`);
  const fields = col.fields ?? [];
  console.log(`\nFields in collection:`);
  for (const f of fields) {
    console.log(`  [${f.slug}] ${f.displayName} (type: ${f.type}${f.required ? ', required' : ''})`);
  }
  return fields;
}

async function createItem(collectionId, chart, fields) {
  // Always include name + slug (Webflow requires them)
  const fieldData = {
    name: chart.title,
    slug: chart.id,
  };

  // Map optional custom fields by common slugs (add more if your collection has them)
  const optional = {
    subtitle:     chart.subtitle,
    description:  chart.subtitle,
    'chart-id':   chart.id,
    'chart-slug': chart.id,
    category:     chart.category,
    source:       chart.source,
  };
  for (const f of fields) {
    if (f.slug in optional && optional[f.slug] != null) {
      fieldData[f.slug] = optional[f.slug];
    }
  }

  const body = { fieldData, isDraft: false, isArchived: false };
  const res  = await api('POST', `/collections/${collectionId}/items`, body);
  return res;
}

async function main() {
  try {
    const col    = await findDataCollection();
    const fields = await getCollectionFields(col.id);

    console.log(`\nCreating ${CATALOG.length} CMS items…`);
    const created = [];
    for (const chart of CATALOG) {
      try {
        const item = await createItem(col.id, chart, fields);
        const id   = item.id ?? item.items?.[0]?.id ?? '?';
        console.log(`  ✓ ${chart.title} (item ID: ${id})`);
        created.push({ chart: chart.id, itemId: id });
      } catch (err) {
        console.error(`  ✗ ${chart.title}: ${err.message}`);
      }
    }

    console.log(`\n✓ Done — ${created.length}/${CATALOG.length} items created.`);
    console.log('\nPublish the site in Webflow Designer to make the pages live.');
    console.log('\nCreated items:');
    console.log(JSON.stringify(created, null, 2));
  } catch (err) {
    console.error('\nFatal:', err.message);
    process.exit(1);
  }
}

main();
