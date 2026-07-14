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
    subtitle: 'BTC/USD daily reference rate',
    category: 'market',
    type:     'line',
    api:      'price',
    unit:     '$',
    source:   'Coin Metrics',
  },
  {
    id:       'market-cap',
    title:    'Market Capitalization',
    subtitle: 'Total BTC market value in USD',
    category: 'market',
    type:     'area',
    api:      'marketcap',
    unit:     '$T',
    source:   'Coin Metrics',
  },
  {
    id:       'volume',
    title:    '24h Trading Volume',
    subtitle: 'Aggregate exchange spot volume',
    category: 'market',
    type:     'bar',
    api:      'volume',
    unit:     '$B',
    source:   'CoinGecko',
  },
  {
    id:       'dominance',
    title:    'Circulating Supply',
    subtitle: 'Total BTC mined to date',
    category: 'market',
    type:     'area',
    api:      'dominance',
    unit:     'M BTC',
    source:   'Coin Metrics',
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
    source:   'Coin Metrics',
  },
  {
    id:       'lth-supply',
    title:    'Miner Revenue',
    subtitle: 'Daily BTC earned by miners (subsidy + fees)',
    category: 'on-chain',
    type:     'area',
    api:      'lth',
    unit:     'BTC',
    source:   'Coin Metrics',
  },
  {
    id:       'exchange-balance',
    title:    'Exchange Balances',
    subtitle: 'Total BTC on exchanges',
    category: 'on-chain',
    type:     'line',
    api:      'exchange',
    unit:     'M BTC',
    source:   'Coin Metrics',
  },
  {
    id:       'nvt',
    title:    'Daily Transactions',
    subtitle: 'On-chain transaction count per day',
    category: 'on-chain',
    type:     'bar',
    api:      'nvt',
    unit:     'K',
    source:   'Coin Metrics',
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
    source:   'Coin Metrics',
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
