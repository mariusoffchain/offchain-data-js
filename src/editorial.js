/**
 * Off-Chain Media — Editorial Content
 * Keyed by chart id.
 * Updated monthly by Marius Off-Chain.
 *
 * Fields:
 *   measures   — what the metric actually tracks
 *   importance — why it matters for Bitcoin
 *   update     — Marius editorial take, updated monthly
 */
export const EDITORIAL = {
  'btc-price': {
    measures:   'The spot price of Bitcoin in USD, volume-weighted across major exchanges.',
    importance: 'The most watched metric in Bitcoin. Price discovery reflects the aggregate conviction of every market participant — miners, holders, speculators, institutions.',
    update:     'After consolidating in the $95k–$105k range through Q1 2026, BTC broke above $108k in early July. The 200-day MA is now acting as support rather than resistance — a structural shift from the bear market regime.',
  },
  'market-cap': {
    measures:   'Total circulating supply × current price. A proxy for Bitcoin\'s weight relative to other global assets.',
    importance: 'Contextualizes Bitcoin within the broader asset landscape. Useful for macro comparisons, though not all BTC is liquid.',
    update:     'Bitcoin\'s market cap now exceeds $2 trillion, placing it firmly in the top 5 global assets by market value. The comparison with sovereign wealth and energy giants is no longer hypothetical.',
  },
  'volume': {
    measures:   'Total spot trading volume aggregated across major exchanges over a rolling 24-hour window.',
    importance: 'Volume validates price moves. High volume on a breakout signals conviction; low volume on a rally signals fragility.',
    update:     'Volume trending higher since May, consistent with the price breakout above $105k. A significant share is now concentrated on regulated venues — a centralization vector worth watching.',
  },
  'dominance': {
    measures:   'Bitcoin\'s market cap as a percentage of the total cryptocurrency market.',
    importance: 'A proxy for capital rotation. Rising dominance signals risk-off behavior within crypto — capital fleeing altcoins back to BTC.',
    update:     'Dominance climbing to multi-year highs driven by ETF inflows that benefit BTC exclusively and general disillusionment with altcoin narratives post-memecoin fatigue.',
  },
  'hashrate': {
    measures:   'Estimated total computational power in exahashes per second dedicated to mining Bitcoin blocks.',
    importance: 'Hashrate is the thermometer of miner conviction. Rising hashrate means miners are betting on Bitcoin\'s future — they\'ve committed capital months in advance.',
    update:     'Post-halving hashrate recovery has been faster than any previous cycle. The 812 EH/s reading reflects massive ASIC deployments in North America, the Gulf States, and parts of Latin America.',
  },
  'difficulty': {
    measures:   'The target threshold that determines how hard it is to find a valid block hash. Recalibrates every ~2,016 blocks (~2 weeks).',
    importance: 'Difficulty is Bitcoin\'s self-regulating immune system. It ensures blocks arrive every ~10 minutes regardless of hashpower fluctuations.',
    update:     'Five consecutive positive adjustments signal sustained miner profitability despite the halved block subsidy. The difficulty ribbon has fully decompressed.',
  },
  'block-fees': {
    measures:   'Average transaction fees included per block, in BTC.',
    importance: 'Tracks the critical transition from subsidy-dependent to fee-dependent miner security — one of Bitcoin\'s most important long-term metrics.',
    update:     'Fees represent 5–8% of miner revenue on average days, spiking to 15–20% during inscription or Runes activity. Still far from fee sustainability, but the trajectory is encouraging.',
  },
  'hashprice': {
    measures:   'Estimated daily USD revenue a miner earns per terahash of computational power deployed.',
    importance: 'The single most important metric for miner economics. When hash price falls below production cost, capitulation follows.',
    update:     'Hash price bottomed at $0.035 in late 2025 and has recovered above the psychological $0.045 threshold. Miners running S21-class hardware are now comfortably profitable.',
  },
  'active-addresses': {
    measures:   'The number of unique Bitcoin addresses that appeared in at least one transaction on a given day.',
    importance: 'A rough proxy for network usage. Rising active addresses during price increases suggests organic demand rather than speculative leverage.',
    update:     'Active addresses crossed 1M/day in June — a threshold last seen during the 2021 bull market. Fewer exchange addresses, more self-custody and Lightning channel opens this time.',
  },
  'lth-supply': {
    measures:   'Total Bitcoin held by addresses that haven\'t transacted in more than 155 days.',
    importance: 'Measures conviction. When LTH supply rises during price increases, it signals accumulation — not distribution.',
    update:     'Long-term holders now control over 75% of supply — the highest ratio ever recorded during an uptrend. Structurally different from 2021, where distribution began much earlier.',
  },
  'exchange-balance': {
    measures:   'Aggregate Bitcoin balance held across known exchange wallets.',
    importance: 'Declining exchange balances suggest coins moving to self-custody — a supply squeeze signal. Rising balances suggest potential sell pressure.',
    update:     'Exchange balances continue their multi-year decline. The ETF effect amplifies this: institutional buyers custody through regulated custodians, not exchange hot wallets.',
  },
  'nvt': {
    measures:   'Market cap divided by daily on-chain transaction volume in USD. Think of it as a P/E ratio for Bitcoin.',
    importance: 'High NVT = the network is valued richly relative to usage. Low NVT = undervalued or usage is spiking.',
    update:     'NVT in the 60–75 range at this price level suggests the rally is fundamentally supported by on-chain activity, not pure speculation.',
  },
  'mempool-size': {
    measures:   'Total size of unconfirmed transactions waiting in the mempool, measured in virtual megabytes.',
    importance: 'The most immediate indicator of network congestion and fee pressure. A full mempool means fee competition is live.',
    update:     'The mempool has been oscillating between 20–60 MB through Q2 2026. No extreme congestion events since the Runes launch spike.',
  },
  'fee-rates': {
    measures:   'The fee rate in sat/vB required to be included in the next block vs. lower priority tiers.',
    importance: 'Fee rates directly impact user experience. Understanding the distribution helps users choose the right fee for their urgency.',
    update:     'Fee rates have stabilized into a more predictable pattern than the chaotic 2024 Ordinals era. The spread between next-block and low-priority has narrowed.',
  },
  'tx-per-second': {
    measures:   'Average number of on-chain transactions confirmed per second over a rolling 24-hour window.',
    importance: 'Bitcoin\'s base layer throughput is deliberately limited. This metric contextualizes the need for Layer 2 solutions.',
    update:     'Bitcoin consistently processes 5–7 tx/s on-chain — unchanged in years by design. This is precisely why Lightning, Ark, and other L2s exist.',
  },
  'block-weight': {
    measures:   'Average weight of mined blocks in million weight units. Max is 4 MWU. Measures how full the available block space is.',
    importance: 'Consistently full blocks mean fee competition is structural, not temporary. Makes the block size debate concrete.',
    update:     'Blocks running at 96% capacity is the new normal. Between financial transactions, inscriptions, and protocol-level data, the 4 MWU limit is tested daily.',
  },
};
