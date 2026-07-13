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

import { PERIOD_N } from './tokens.js';

// ─── In-memory cache (keyed by api id) ───────────────────────────
const cache = {};

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
  volume:     () => mockSeries(13, 365, 35e9,     8e9,     1e8),
  dominance:  () => mockSeries(6,  365, 55,       3,       0.02),
  hashrate:   () => mockSeries(3,  365, 600,      25,      0.6),
  difficulty: () => mockSeries(9,  52,  80,       5,       0.15),
  fees:       () => mockSeries(11, 90,  0.15,     0.05,    0.001),
  hashprice:  () => mockSeries(12, 180, 0.042,    0.008,   0.0001),
  addresses:  () => mockSeries(14, 365, 900_000,  80_000,  500),
  lth:        () => mockSeries(13, 365, 14.2,     0.3,     0.003),
  exchange:   () => mockSeries(15, 365, 2.8,      0.04,   -0.001),
  nvt:        () => mockSeries(16, 365, 65,       8,       0.02),
  mempool:    () => mockSeries(17, 90,  35,       18,      0.05),
  feerates:   () => mockSeries(18, 90,  15,       10,      0.02),
  tps:        () => mockSeries(19, 90,  5.5,      1,       0.002),
  blockweight:() => mockSeries(20, 90,  3.7,      0.2,     0.001),
};

// ─── Live fetchers ────────────────────────────────────────────────

async function fetchHashrate() {
  const r = await fetch('https://mempool.space/api/v1/mining/hashrate/1y');
  if (!r.ok) throw new Error(`hashrate HTTP ${r.status}`);
  const j = await r.json();
  return j.hashrates.map(d => ({ ts: d.timestamp * 1000, v: d.avgHashrate / 1e18 }));
}

// CoinGecko: fetch market chart once, split into price / marketcap / volume
async function fetchMarketChart() {
  if (cache._market) return cache._market;
  // TODO: replace with your CoinGecko API key for live data
  // const r = await fetch('https://pro-api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily&x_cg_pro_api_key=YOUR_KEY');
  const r = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily');
  if (!r.ok) throw new Error(`CoinGecko HTTP ${r.status}`);
  const j = await r.json();
  cache._market = {
    price:     j.prices.map(([ts, v]) => ({ ts, v })),
    marketcap: j.market_caps.map(([ts, v]) => ({ ts, v: v / 1e12 })), // → trillions
    volume:    j.total_volumes.map(([ts, v]) => ({ ts, v: v / 1e9 })), // → billions
  };
  return cache._market;
}

// Map api id → async fetcher function
const FETCHERS = {
  hashrate:  fetchHashrate,
  price:     async () => (await fetchMarketChart()).price,
  marketcap: async () => (await fetchMarketChart()).marketcap,
  volume:    async () => (await fetchMarketChart()).volume,
  // Add more fetchers here as APIs become available:
  // difficulty: fetchDifficulty,
  // mempool: fetchMempool,
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
 * Trims data array to the last N points for the requested period.
 */
export function slicePeriod(data, period) {
  const n = PERIOD_N[period] ?? data.length;
  return data.slice(-Math.min(n, data.length));
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
