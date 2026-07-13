/**
 * Off-Chain Media — Chart Catalog
 * Defines all charts displayed on /data
 *
 * Fields:
 *   id        — unique slug, matches data-chart-id in HTML
 *   title     — display name
 *   subtitle  — short description for card
 *   category  — "market" | "mining" | "on-chain" | "mempool"
 *   type      — "line" | "area" | "bar" | "donut"
 *   api       — key used by data.js fetchers
 *   unit      — display unit for formatted values
 *   source    — data source attribution
 */
export const CATALOG = [
  // ── MARKET ─────────────────────────────────────────────────────
  {
    id:       'btc-price',
    title:    'Bitcoin Price',
    subtitle: 'BTC/USD spot price',
    category: 'market',
    type:     'line',
    api:      'price',
    unit:     '$',
    source:   'CoinGecko',
  },
  {
    id:       'market-cap',
    title:    'Market Capitalization',
    subtitle: 'Total BTC market value',
    category: 'market',
    type:     'area',
    api:      'marketcap',
    unit:     '$T',
    source:   'CoinGecko',
  },
  {
    id:       'volume',
    title:    '24h Trading Volume',
    subtitle: 'Aggregate spot volume',
    category: 'market',
    type:     'bar',
    api:      'volume',
    unit:     '$B',
    source:   'CoinGecko',
  },
  {
    id:       'dominance',
    title:    'BTC Dominance',
    subtitle: 'Share of total crypto market cap',
    category: 'market',
    type:     'line',
    api:      'dominance',
    unit:     '%',
    source:   'CoinGecko',
  },

  // ── MINING ─────────────────────────────────────────────────────
  {
    id:       'hashrate',
    title:    'Network Hashrate',
    subtitle: 'Total computational power',
    category: 'mining',
    type:     'line',
    api:      'hashrate',
    unit:     'EH/s',
    source:   'mempool.space',
  },
  {
    id:       'difficulty',
    title:    'Mining Difficulty',
    subtitle: 'Adjusted every 2,016 blocks',
    category: 'mining',
    type:     'line',
    api:      'difficulty',
    unit:     'T',
    source:   'mempool.space',
  },
  {
    id:       'block-fees',
    title:    'Block Fees',
    subtitle: 'Average fees per block',
    category: 'mining',
    type:     'bar',
    api:      'fees',
    unit:     'BTC',
    source:   'mempool.space',
  },
  {
    id:       'hashprice',
    title:    'Hash Price',
    subtitle: 'Daily revenue per TH/s',
    category: 'mining',
    type:     'line',
    api:      'hashprice',
    unit:     '$/TH',
    source:   'mempool.space',
  },

  // ── ON-CHAIN ───────────────────────────────────────────────────
  {
    id:       'active-addresses',
    title:    'Active Addresses',
    subtitle: 'Unique addresses used daily',
    category: 'on-chain',
    type:     'area',
    api:      'addresses',
    unit:     'K',
    source:   'Glassnode',
  },
  {
    id:       'lth-supply',
    title:    'Long-Term Holder Supply',
    subtitle: 'BTC held >155 days',
    category: 'on-chain',
    type:     'area',
    api:      'lth',
    unit:     'M BTC',
    source:   'Glassnode',
  },
  {
    id:       'exchange-balance',
    title:    'Exchange Balances',
    subtitle: 'Total BTC on exchanges',
    category: 'on-chain',
    type:     'line',
    api:      'exchange',
    unit:     'M BTC',
    source:   'Glassnode',
  },
  {
    id:       'nvt',
    title:    'NVT Ratio',
    subtitle: 'Network Value to Transactions',
    category: 'on-chain',
    type:     'line',
    api:      'nvt',
    unit:     '',
    source:   'Glassnode',
  },

  // ── MEMPOOL ────────────────────────────────────────────────────
  {
    id:       'mempool-size',
    title:    'Mempool Size',
    subtitle: 'Pending transactions in vBytes',
    category: 'mempool',
    type:     'area',
    api:      'mempool',
    unit:     'MB',
    source:   'mempool.space',
  },
  {
    id:       'fee-rates',
    title:    'Fee Rate Distribution',
    subtitle: 'sat/vB by confirmation priority',
    category: 'mempool',
    type:     'bar',
    api:      'feerates',
    unit:     'sat/vB',
    source:   'mempool.space',
  },
  {
    id:       'tx-per-second',
    title:    'Transactions Per Second',
    subtitle: 'On-chain throughput',
    category: 'mempool',
    type:     'line',
    api:      'tps',
    unit:     'tx/s',
    source:   'mempool.space',
  },
  {
    id:       'block-weight',
    title:    'Average Block Weight',
    subtitle: 'How full are Bitcoin blocks?',
    category: 'mempool',
    type:     'bar',
    api:      'blockweight',
    unit:     'MWU',
    source:   'mempool.space',
  },
];

export const CATEGORIES = ['market', 'mining', 'on-chain', 'mempool'];
