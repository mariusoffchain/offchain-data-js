/**
 * Off-Chain Media — Data Layer
 *
 * Priority order per metric:
 *   1. Live API (mempool.space or CoinGecko)
 *   2. Mock fallback (deterministic, seeded)
 *
 * All data normalized to: Array<{ ts: number (ms), v: number }>
 *
 * To add a live API:
 *   1. Write a fetch function below
 *   2. Add it to FETCHERS map
 *   3. Done — mock fallback kicks in automatically on failure
 */

// PERIOD_N removed — slicePeriod now filters by timestamp, not count

// ─── API configuration ────────────────────────────────────────────
// mempool.space blocks browser CORS, so all its endpoints go through
// the Cloudflare Worker proxy (source + deploy steps in worker/).
// Until the worker is live these fetchers fail → mock fallback.
const MEMPOOL_BASE = 'https://ocm-proxy.offchainmedia.workers.dev';

// CoinGecko free "demo" key (30 req/min) — create one at
// https://www.coingecko.com/en/developers/dashboard, paste it here,
// then `npm run build` and push.
const COINGECKO_API_KEY = '';

// Coin Metrics Community API — free, no key, open CORS. Covers metrics
// Glassnode would otherwise charge for (active addresses, exchange
// supply, tx count).
const COINMETRICS_BASE = 'https://community-api.coinmetrics.io/v4/timeseries/asset-metrics';

// Current block subsidy (post-2024 halving). Stable until the next
// halving around block 1,050,000 (~2028) — revisit this constant then.
const BLOCK_SUBSIDY_BTC = 3.125;
const BLOCKS_PER_DAY    = 144;

// ─── In-memory cache (keyed by api id) ───────────────────────────
const cache = {};
const _cmCache = {}; // Coin Metrics metric-level cache (avoids duplicate requests)

// ─── Mock generator (seeded, deterministic) ──────────────────────
function mockSeries(seed, length, base, amp, trend) {
  let val = base;
  let s   = seed;
  const now = Date.now();
  return Array.from({ length }, (_, i) => {
    s    = (s * 9301 + 49297) % 233280;
    val += Math.sin(i * 0.5 + seed) * amp + trend;
    val  = Math.max(base * 0.3, val);
    return { ts: now - (length - i) * 86_400_000, v: val };
  });
}

// Each mock keyed by api id
const MOCK = {
  price:      () => mockSeries(5,  365, 85_000,   4_000,   120),
  marketcap:  () => mockSeries(7,  365, 1.6e12,   8e10,    3e9),
  volume:     () => mockSeries(13, 365, 35,        8,       0.1),   // in $B, matches fetchVolume
  dominance:  () => mockSeries(6,  365, 19.8,     0.05,    0.001),
  hashrate:   () => mockSeries(3,  365, 600,      25,      0.6),
  difficulty: () => mockSeries(9,  52,  80,       5,       0.15),
  fees:       () => mockSeries(11, 90,  0.15,     0.05,    0.001),
  hashprice:  () => mockSeries(12, 180, 0.042,    0.008,   0.0001),
  addresses:  () => mockSeries(14, 365, 900_000,  80_000,  500),
  lth:        () => mockSeries(13, 365, 500,      30,      0.5),
  exchange:   () => mockSeries(15, 365, 2.8,      0.04,   -0.001),
  nvt:        () => mockSeries(16, 365, 600_000,  50_000,  100),
  lnnodes:      () => mockSeries(21, 365, 16_000,   500,     10),
  lnchannels:   () => mockSeries(22, 365, 65_000,   2_000,   50),
  lncapacity:   () => mockSeries(23, 365, 5_300,    50,      1),
  lnavgchannel: () => mockSeries(25, 365, 0.046,    0.004,  -0.00005),
  blockrewards: () => mockSeries(24, 1825, 3.25,    0.4,    -0.0002),
  mempool:      () => mockSeries(17, 90,  35,       18,      0.05),
  feerates:     () => mockSeries(18, 90,  15,       10,      0.02),
  tps:          () => mockSeries(19, 90,  5.5,      1,       0.002),
  blockweight:  () => mockSeries(20, 90,  3.7,      0.2,     0.001),
  miningpools: () => {
    const now = Date.now();
    return [
      { ts: now,       v: 31.2, name: 'Foundry USA' },
      { ts: now - 100, v: 19.8, name: 'AntPool' },
      { ts: now - 200, v: 14.5, name: 'F2Pool' },
      { ts: now - 300, v:  9.3, name: 'ViaBTC' },
      { ts: now - 400, v:  8.1, name: 'MARA Pool' },
      { ts: now - 500, v:  5.4, name: 'Braiins Pool' },
      { ts: now - 600, v:  4.2, name: 'Luxor' },
      { ts: now - 700, v:  3.1, name: 'BTC.com' },
      { ts: now - 800, v:  2.4, name: 'Poolin' },
      { ts: now - 900, v:  2.0, name: 'Others' },
    ];
  },
  lncountries: () => {
    const now = Date.now();
    return [
      { ts: now,         v: 2450, name: 'United States' },
      { ts: now -  100,  v: 1100, name: 'Germany' },
      { ts: now -  200,  v:  680, name: 'France' },
      { ts: now -  300,  v:  590, name: 'Netherlands' },
      { ts: now -  400,  v:  510, name: 'United Kingdom' },
      { ts: now -  500,  v:  380, name: 'Canada' },
      { ts: now -  600,  v:  340, name: 'Finland' },
      { ts: now -  700,  v:  290, name: 'Australia' },
      { ts: now -  800,  v:  260, name: 'Japan' },
      { ts: now -  900,  v:  230, name: 'Sweden' },
    ];
  },
  lnisp: () => {
    const now = Date.now();
    return [
      { ts: now,         v: 850, name: 'Amazon.com' },
      { ts: now -  100,  v: 620, name: 'Hetzner Online' },
      { ts: now -  200,  v: 480, name: 'Contabo' },
      { ts: now -  300,  v: 310, name: 'DigitalOcean' },
      { ts: now -  400,  v: 260, name: 'OVH SAS' },
      { ts: now -  500,  v: 190, name: 'Google Cloud' },
      { ts: now -  600,  v: 160, name: 'Microsoft Azure' },
      { ts: now -  700,  v: 130, name: 'Linode / Akamai' },
      { ts: now -  800,  v: 110, name: 'Vultr' },
      { ts: now -  900,  v:  90, name: 'Home ISPs' },
    ];
  },
};

// ─── Live fetchers ────────────────────────────────────────────────

// Bucket a series by UTC day and average, so every API lines up with
// PERIOD_N's one-point-per-day assumption.
function dailyAvg(points) {
  const days = new Map();
  for (const { ts, v } of points) {
    const day = Math.floor(ts / 86_400_000);
    const b   = days.get(day) || { sum: 0, n: 0 };
    b.sum += v;
    b.n   += 1;
    days.set(day, b);
  }
  return [...days.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, { sum, n }]) => ({ ts: day * 86_400_000, v: sum / n }));
}

async function fetchHashrate() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/mining/hashrate/all`);
  if (!r.ok) throw new Error(`hashrate HTTP ${r.status}`);
  const j = await r.json();
  return j.hashrates.map(d => ({ ts: d.timestamp * 1000, v: d.avgHashrate / 1e18 }));
}

async function fetchDifficulty() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/mining/difficulty-adjustments/all`);
  if (!r.ok) throw new Error(`difficulty HTTP ${r.status}`);
  const j = await r.json(); // [[ts_s, height, difficulty, adjustment], ...] newest first
  return j
    .map(([ts, , diff]) => ({ ts: ts * 1000, v: diff / 1e12 }))
    .sort((a, b) => a.ts - b.ts);
}

async function fetchBlockFees() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/mining/blocks/fees/all`);
  if (!r.ok) throw new Error(`fees HTTP ${r.status}`);
  const j = await r.json(); // [{ timestamp, avgFees (sats) }, ...]
  return dailyAvg(j.map(d => ({ ts: d.timestamp * 1000, v: d.avgFees / 1e8 })));
}

async function fetchFeeRates() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/mining/blocks/fee-rates/all`);
  if (!r.ok) throw new Error(`feerates HTTP ${r.status}`);
  const j = await r.json(); // [{ timestamp, avgFee_50 (sat/vB) }, ...]
  return dailyAvg(j.map(d => ({ ts: d.timestamp * 1000, v: d.avgFee_50 })));
}

async function fetchMempool() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/statistics/all`);
  if (!r.ok) throw new Error(`mempool HTTP ${r.status}`);
  const j = await r.json(); // [{ added (ts_s), vsizes: [vB per fee bucket] }, ...] newest first
  return dailyAvg(j.map(d => ({
    ts: d.added * 1000,
    v:  d.vsizes.reduce((a, b) => a + b, 0) / 1e6, // total pending vMB
  })));
}

async function fetchBlockWeight() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/mining/blocks/sizes-weights/all`);
  if (!r.ok) throw new Error(`blockweight HTTP ${r.status}`);
  const j = await r.json(); // { weights: [{ timestamp, avgWeight (WU) }, ...] }
  return dailyAvg(j.weights.map(d => ({ ts: d.timestamp * 1000, v: d.avgWeight / 1e6 })));
}

// Lightning Network stats — all three charts share one API call (cache avoids duplicates).
let _lnCache = null;
async function _fetchLightningStats() {
  if (_lnCache) return _lnCache;
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/lightning/statistics/3y`);
  if (!r.ok) throw new Error(`lightning stats HTTP ${r.status}`);
  _lnCache = await r.json();
  return _lnCache;
}

async function fetchLightningNodes() {
  const j = await _fetchLightningStats();
  // API returns node breakdown, not a single node_count field
  return j.map(d => ({
    ts: d.added * 1000,
    v: (d.tor_nodes || 0) + (d.clearnet_nodes || 0) + (d.clearnet_tor_nodes || 0),
  }));
}

async function fetchLightningChannels() {
  const j = await _fetchLightningStats();
  return j.map(d => ({ ts: d.added * 1000, v: d.channel_count }));
}

async function fetchLightningCapacity() {
  const j = await _fetchLightningStats();
  return j.map(d => ({ ts: d.added * 1000, v: d.total_capacity / 1e8 })); // sats → BTC
}

async function fetchLightningAvgChannel() {
  const j = await _fetchLightningStats();
  return j
    .filter(d => d.channel_count > 0)
    .map(d => ({ ts: d.added * 1000, v: (d.total_capacity / 1e8) / d.channel_count }));
}

// Block Rewards — average total reward (subsidy + fees) per block.
async function fetchBlockRewards() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/mining/blocks/rewards/all`);
  if (!r.ok) throw new Error(`blockRewards HTTP ${r.status}`);
  const j = await r.json(); // [{ timestamp, avgRewards (sats) }, ...]
  return dailyAvg(j.map(d => ({ ts: d.timestamp * 1000, v: d.avgRewards / 1e8 })));
}

// Ranking snapshots — data has dummy sequential timestamps so slicePeriod('ALL') passes.
// Period buttons are hidden for ranking charts in gallery.js.

async function fetchMiningPools() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/mining/pools/1y`);
  if (!r.ok) throw new Error(`miningPools HTTP ${r.status}`);
  const j = await r.json(); // { pools: [{name, blockCount, ...}], blockCount }
  const total = j.blockCount || 1;
  const now = Date.now();
  return j.pools
    .slice(0, 15)
    .map((p, i) => ({ ts: now - i * 100, v: (p.blockCount / total) * 100, name: p.name }));
}

async function fetchLightningCountries() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/lightning/nodes/countries`);
  if (!r.ok) throw new Error(`lnCountries HTTP ${r.status}`);
  const j = await r.json(); // { 'US': { name, count, capacity, share }, ... }
  const now = Date.now();
  return Object.entries(j)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15)
    .map(([, d], i) => ({ ts: now - i * 100, v: d.count, name: d.name || d.isoCode }));
}

async function fetchLightningISP() {
  const r = await fetch(`${MEMPOOL_BASE}/api/v1/lightning/nodes/isp-ranking`);
  if (!r.ok) throw new Error(`lnISP HTTP ${r.status}`);
  const j = await r.json(); // [{ isp, count, capacity, share }, ...]
  const now = Date.now();
  return j
    .slice(0, 15)
    .map((d, i) => ({ ts: now - i * 100, v: d.count, name: d.isp || 'Unknown' }));
}

// Coin Metrics: one metric per call, browser-fetchable directly (no proxy).
// Results are cached at the metric level so parallel fetchers don't duplicate requests.
async function fetchCoinMetric(metric) {
  if (_cmCache[metric]) return _cmCache[metric];
  const end   = new Date();
  const start = new Date('2010-01-01'); // earliest market price data available
  const url = `${COINMETRICS_BASE}?assets=btc&metrics=${metric}&frequency=1d`
    + `&start_time=${start.toISOString().slice(0, 10)}&end_time=${end.toISOString().slice(0, 10)}`
    + `&page_size=10000`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${metric} HTTP ${r.status}`);
  const j = await r.json();
  const data = j.data.map(d => ({ ts: new Date(d.time).getTime(), v: parseFloat(d[metric]) }));
  _cmCache[metric] = data;
  return data;
}

async function fetchAddresses() {
  return fetchCoinMetric('AdrActCnt'); // raw count; fmtVal('K') divides by 1000
}

async function fetchTps() {
  return (await fetchCoinMetric('TxCnt')).map(({ ts, v }) => ({ ts, v: v / 86_400 }));
}

async function fetchExchangeBalance() {
  return (await fetchCoinMetric('SplyExNtv')).map(({ ts, v }) => ({ ts, v: v / 1_000_000 }));
}

// Derived, not fetched: daily miner revenue per TH/s, from data other
// fetchers already pull (avoids a 4th network dependency for one chart).
async function fetchHashPrice() {
  const [{ data: fees }, { data: hash }, { data: price }] = await Promise.all([
    loadData('fees'),
    loadData('hashrate'),
    loadData('price'),
  ]);
  const hashByDay  = new Map(hash.map(d => [Math.floor(d.ts / 86_400_000), d.v]));
  const priceByDay = new Map(price.map(d => [Math.floor(d.ts / 86_400_000), d.v]));
  return fees
    .map(({ ts, v: avgFeeBtc }) => {
      const day = Math.floor(ts / 86_400_000);
      const hashrate = hashByDay.get(day);
      const usd      = priceByDay.get(day);
      if (hashrate == null || usd == null) return null;
      const dailyRevenueUsd = BLOCKS_PER_DAY * (BLOCK_SUBSIDY_BTC + avgFeeBtc) * usd;
      return { ts, v: dailyRevenueUsd / (hashrate * 1e6) }; // EH/s → TH/s
    })
    .filter(Boolean);
}

// Price + market cap from Coin Metrics (free, no key, open CORS — more reliable than
// CoinGecko's public endpoint which rate-limits anonymous requests).
async function fetchPrice() {
  const daily = await fetchCoinMetric('PriceUSD');

  // Supplement with CoinGecko hourly data for the last 30 days.
  // CoinGecko auto-selects hourly when days ≤ 90 and no interval= is set.
  try {
    const key = COINGECKO_API_KEY ? `&x_cg_demo_api_key=${COINGECKO_API_KEY}` : '';
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30${key}`
    );
    if (r.ok) {
      const j = await r.json();
      const hourly = (j.prices || [])
        .filter(([, v]) => v != null)
        .map(([ts, v]) => ({ ts, v }));
      if (hourly.length > 24) {
        // Replace last 30 days of daily with hourly for finer resolution
        const cutoff = hourly[0].ts;
        return [...daily.filter(d => d.ts < cutoff), ...hourly];
      }
    }
  } catch { /* hourly supplement is optional */ }

  return daily;
}

async function fetchMarketCap() {
  return (await fetchCoinMetric('CapMrktCurUSD')).map(d => ({ ts: d.ts, v: d.v / 1e12 }));
}

// 24h trading volume: no free on-chain proxy for exchange volume → keep CoinGecko.
// No interval=daily: CoinGecko auto-selects daily for 365 days.
async function fetchVolume() {
  const key = COINGECKO_API_KEY ? `&x_cg_demo_api_key=${COINGECKO_API_KEY}` : '';
  const r = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365${key}`);
  if (!r.ok) throw new Error(`CoinGecko volume HTTP ${r.status}`);
  const j = await r.json();
  if (!j.total_volumes?.length) throw new Error('CoinGecko volume: empty response');
  return j.total_volumes
    .filter(([, v]) => v != null && v > 0)
    .map(([ts, v]) => ({ ts, v: v / 1e9 }));
}

// Circulating Supply — SplyCur / 1e6 → M BTC.
// Replaces BTC dominance (no free historical dominance source exists).
async function fetchCircSupply() {
  return (await fetchCoinMetric('SplyCur')).map(d => ({ ts: d.ts, v: d.v / 1e6 }));
}

// Daily transaction count — raw TxCnt; fmtVal('K') divides by 1000 for display.
// Replaces NVT (TxTfrValAdjUSD is paywalled on Coin Metrics community plan).
async function fetchTxCount() {
  return fetchCoinMetric('TxCnt');
}

// Daily miner revenue: block subsidy (IssTotNtv) + fees (FeeTotNtv), in BTC.
// Replaces LTH Supply (SplyAct1yr is paywalled on Coin Metrics community plan).
async function fetchMinerRevenue() {
  const [issuance, fees] = await Promise.all([
    fetchCoinMetric('IssTotNtv'),
    fetchCoinMetric('FeeTotNtv'),
  ]);
  const feeByDay = new Map(fees.map(d => [Math.floor(d.ts / 86_400_000), d.v]));
  return issuance.map(({ ts, v: iss }) => ({
    ts,
    v: iss + (feeByDay.get(Math.floor(ts / 86_400_000)) ?? 0),
  }));
}

// ─── Block explorer strip (mempool + confirmed blocks) ────────────
// Not part of the {ts,v} time-series system above — these return
// structured block objects, rendered by ui/blockstrip.js.

function mockMempoolBlocks() {
  return [
    { medianFee: 2.1, feeRange: [1.0, 1.2, 1.3, 2.0, 2.7, 4.0, 201], nTx: 4327, totalFees: 2500000, blockSize: 2054070 },
    { medianFee: 1.4, feeRange: [0.5, 0.6, 0.7, 1.0, 1.5, 2.2, 150],  nTx: 6755, totalFees: 1600000, blockSize: 1997000 },
    { medianFee: 0.6, feeRange: [0.36, 0.4, 0.42, 0.5, 0.7, 1.0, 45], nTx: 5777, totalFees: 950000,  blockSize: 1584123 },
  ];
}

function mockRecentBlocks() {
  const pools = ['F2Pool', 'Foundry USA', 'Luxor', 'AntPool', 'ViaBTC', 'ⓈBTC.com'];
  const now = Date.now();
  return Array.from({ length: 6 }, (_, i) => ({
    height:    957896 - i,
    timestamp: Math.floor((now - i * 9.7 * 60_000) / 1000),
    tx_count:  4362 - i * 235,
    size:      1561683 + i * 12000,
    extras: {
      medianFee: 1.1 + i * 0.1,
      feeRange:  [0.55 - i * 0.02, 0.7, 1, 2, 3, 5, 161 - i * 10],
      totalFees: 1883531 - i * 90000,
      pool:      { name: pools[i % pools.length] },
    },
  }));
}

/**
 * loadMempoolBlocks()
 * Returns { data: Array<projected block>, live: boolean }
 */
export async function loadMempoolBlocks() {
  try {
    const r = await fetch(`${MEMPOOL_BASE}/api/v1/fees/mempool-blocks`);
    if (!r.ok) throw new Error(`mempool-blocks HTTP ${r.status}`);
    return { data: await r.json(), live: true };
  } catch (err) {
    console.warn('[data] Falling back to mock for "mempool-blocks":', err.message);
    return { data: mockMempoolBlocks(), live: false };
  }
}

/**
 * loadRecentBlocks()
 * Returns { data: Array<confirmed block>, live: boolean }
 */
export async function loadRecentBlocks() {
  try {
    // v1, not the plain /api/blocks — only v1 includes `extras`
    // (pool name, medianFee, feeRange, totalFees) that the strip renders.
    const r = await fetch(`${MEMPOOL_BASE}/api/v1/blocks`);
    if (!r.ok) throw new Error(`blocks HTTP ${r.status}`);
    return { data: await r.json(), live: true };
  } catch (err) {
    console.warn('[data] Falling back to mock for "blocks":', err.message);
    return { data: mockRecentBlocks(), live: false };
  }
}

/**
 * fmtTimeAgo(unixSeconds)
 * Relative time for confirmed blocks, e.g. "15 min ago".
 */
export function fmtTimeAgo(unixSeconds) {
  const diffMin = Math.max(0, Math.round((Date.now() - unixSeconds * 1000) / 60_000));
  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  return `${Math.round(diffMin / 60)}h ago`;
}

// Map api id → async fetcher function
const FETCHERS = {
  hashrate:    fetchHashrate,
  difficulty:  fetchDifficulty,
  fees:        fetchBlockFees,
  feerates:    fetchFeeRates,
  mempool:     fetchMempool,
  blockweight: fetchBlockWeight,
  addresses:   fetchAddresses,
  tps:         fetchTps,
  exchange:    fetchExchangeBalance,
  hashprice:   fetchHashPrice,
  price:       fetchPrice,
  marketcap:   fetchMarketCap,
  volume:      fetchVolume,
  dominance:   fetchCircSupply,
  nvt:         fetchTxCount,
  lth:         fetchMinerRevenue,
  lnnodes:      fetchLightningNodes,
  lnchannels:   fetchLightningChannels,
  lncapacity:   fetchLightningCapacity,
  lnavgchannel: fetchLightningAvgChannel,
  blockrewards: fetchBlockRewards,
  miningpools:  fetchMiningPools,
  lncountries:  fetchLightningCountries,
  lnisp:        fetchLightningISP,
};

// ─── Public API ───────────────────────────────────────────────────

/**
 * loadData(apiKey)
 * Returns { data: Array<{ts,v}>, live: boolean }
 * Falls back to mock on any error.
 */
export async function loadData(apiKey) {
  // Return from cache if available
  if (cache[apiKey]) return { data: cache[apiKey], live: true };

  const fetcher = FETCHERS[apiKey];
  if (fetcher) {
    try {
      const data    = await fetcher();
      cache[apiKey] = data;
      return { data, live: true };
    } catch (err) {
      console.warn(`[data] Falling back to mock for "${apiKey}":`, err.message);
    }
  }

  // Mock fallback
  const mockFn = MOCK[apiKey] || MOCK.price;
  return { data: mockFn(), live: false };
}

/**
 * slicePeriod(data, period)
 * Filters data to the time window matching the period.
 * Works with both daily and sub-daily (hourly) data.
 */
export function slicePeriod(data, period) {
  if (!data.length || period === 'ALL') return data;
  const days = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365 }[period];
  if (!days) return data;
  const cutoff = Date.now() - days * 86_400_000;
  return data.filter(d => d.ts >= cutoff);
}

/**
 * fmtVal(value, unit)
 * Formats a numeric value with its unit for display.
 */
export function fmtVal(v, unit) {
  if (unit === '$')     return v >= 1_000 ? `$${(v / 1_000).toFixed(0)}k` : `$${v.toFixed(0)}`;
  if (unit === '$T')    return `$${v.toFixed(2)}T`;
  if (unit === '$B')    return `$${v.toFixed(1)}B`;
  if (unit === 'EH/s')  return `${v.toFixed(1)} EH/s`;
  if (unit === '%')     return `${v.toFixed(1)}%`;
  if (unit === 'M BTC') return `${v.toFixed(2)}M BTC`;
  if (unit === 'K')     return `${(v / 1_000).toFixed(0)}K`;
  if (unit === 'BTC')   return `${v.toFixed(3)} BTC`;
  if (unit === 'T')     return `${v.toFixed(1)}T`;
  return v != null ? `${v.toFixed(2)}${unit ? ' ' + unit : ''}` : '—';
}

/**
 * fmtValBig(value, unit)
 * Full-precision headline formatter — e.g. "$62,847" instead of "$63k".
 * Used for the large current-value readout on chart cards.
 */
export function fmtValBig(v, unit) {
  if (v == null) return '—';
  if (unit === '$')   return `$${Math.round(v).toLocaleString('en-US')}`;
  if (unit === 'BTC') return `${v.toFixed(4)} BTC`;
  if (unit === 'K')   return Math.round(v).toLocaleString('en-US');
  return fmtVal(v, unit);
}

/**
 * fmtValTooltip(value, unit)
 * High-precision formatter for hover tooltips — shows more decimals than fmtVal.
 */
export function fmtValTooltip(v, unit) {
  if (v == null) return '—';
  if (unit === '$') {
    if (v >= 1_000) return `$${Math.round(v).toLocaleString('en-US')}`;
    if (v >= 1)     return `$${v.toFixed(2)}`;
    return `$${v.toFixed(5)}`;
  }
  if (unit === '$T')    return `$${v.toFixed(3)}T`;
  if (unit === '$B')    return `$${v.toFixed(2)}B`;
  if (unit === 'EH/s')  return `${v.toFixed(2)} EH/s`;
  if (unit === 'M BTC') return `${v.toFixed(3)}M BTC`;
  if (unit === 'K')     return `${Math.round(v).toLocaleString('en-US')}`;
  if (unit === 'BTC')   return `${v.toFixed(4)} BTC`;
  if (unit === 'T')     return `${v.toFixed(2)}T`;
  if (unit === '%')     return `${v.toFixed(2)}%`;
  // adaptive precision for sat/vB, tx/s, MWU, MB, $/TH …
  const a = Math.abs(v);
  const dp = a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : a >= 0.1 ? 4 : 5;
  return `${v.toFixed(dp)}${unit ? ' ' + unit : ''}`;
}

/**
 * fmtDate(timestamp)
 * Formats a Unix ms timestamp as a readable date.
 */
export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}
