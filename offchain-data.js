/**
 * Off-Chain Media — Bitcoin Data Library
 * Self-contained JS bundle for Webflow embed
 *
 * Handles:
 *  - Category filter tabs
 *  - Gallery ↔ Detail navigation
 *  - Mini sparklines on cards (SVG, live data)
 *  - Full interactive charts in detail view (SVG, relief style)
 *  - Period selector
 *  - Hover tooltip
 *  - Live data from mempool.space + CoinGecko (with mock fallback)
 *
 * No dependencies. Pure vanilla JS + SVG.
 * Design tokens: Oswald/Spectral, #F7931A accent, #1a1a1a ink, #FAF7F1 paper
 */

(function () {
  'use strict';

  // ─── DESIGN TOKENS ───────────────────────────────────────────────
  const T = {
    accent:  '#F7931A',
    ink:     '#1a1a1a',
    paper:   '#FAF7F1',
    muted:   'rgba(128,128,128,0.5)',
    grid:    'rgba(128,128,128,0.12)',
    heading: "'Oswald', 'Arial Narrow', sans-serif",
    body:    "'Spectral', Georgia, serif",
  };

  // ─── CATALOG ─────────────────────────────────────────────────────
  // Each entry maps a data-chart-id to its config
  const CATALOG = {
    'btc-price':        { title: 'Bitcoin Price',            subtitle: 'BTC/USD spot price',                  unit: '$',     source: 'CoinGecko',    api: 'price',      type: 'line', category: 'market'   },
    'market-cap':       { title: 'Market Capitalization',    subtitle: 'Total BTC market value',              unit: '$T',    source: 'CoinGecko',    api: 'marketcap',  type: 'area', category: 'market'   },
    'volume':           { title: '24h Trading Volume',       subtitle: 'Aggregate spot volume',               unit: '$B',    source: 'CoinGecko',    api: 'volume',     type: 'bar',  category: 'market'   },
    'dominance':        { title: 'BTC Dominance',            subtitle: 'Share of total crypto market cap',    unit: '%',     source: 'CoinGecko',    api: 'dominance',  type: 'line', category: 'market'   },
    'hashrate':         { title: 'Network Hashrate',         subtitle: 'Total computational power',           unit: 'EH/s',  source: 'mempool.space', api: 'hashrate',  type: 'line', category: 'mining'   },
    'difficulty':       { title: 'Mining Difficulty',        subtitle: 'Adjusted every 2,016 blocks',         unit: 'T',     source: 'mempool.space', api: 'difficulty', type: 'line', category: 'mining'   },
    'block-fees':       { title: 'Block Fees',               subtitle: 'Average fees per block',              unit: 'BTC',   source: 'mempool.space', api: 'fees',       type: 'bar',  category: 'mining'   },
    'hashprice':        { title: 'Hash Price',               subtitle: 'Daily revenue per TH/s',             unit: '$/TH',  source: 'mempool.space', api: 'hashprice',  type: 'line', category: 'mining'   },
    'active-addresses': { title: 'Active Addresses',         subtitle: 'Unique addresses used daily',         unit: 'K',     source: 'Glassnode',    api: 'addresses',  type: 'area', category: 'on-chain' },
    'lth-supply':       { title: 'Long-Term Holder Supply',  subtitle: 'BTC held >155 days',                  unit: 'M BTC', source: 'Glassnode',    api: 'lth',        type: 'area', category: 'on-chain' },
    'exchange-balance': { title: 'Exchange Balances',        subtitle: 'Total BTC on exchanges',              unit: 'M BTC', source: 'Glassnode',    api: 'exchange',   type: 'line', category: 'on-chain' },
    'nvt':              { title: 'NVT Ratio',                subtitle: 'Network Value to Transactions',       unit: '',      source: 'Glassnode',    api: 'nvt',        type: 'line', category: 'on-chain' },
    'mempool-size':     { title: 'Mempool Size',             subtitle: 'Pending transactions in vBytes',      unit: 'MB',    source: 'mempool.space', api: 'mempool',   type: 'area', category: 'mempool'  },
    'fee-rates':        { title: 'Fee Rate Distribution',    subtitle: 'sat/vB by confirmation priority',     unit: 'sat/vB', source: 'mempool.space', api: 'feerates', type: 'bar',  category: 'mempool'  },
    'tx-per-second':    { title: 'Transactions Per Second',  subtitle: 'On-chain throughput',                 unit: 'tx/s',  source: 'mempool.space', api: 'tps',       type: 'line', category: 'mempool'  },
    'block-weight':     { title: 'Average Block Weight',     subtitle: 'How full are Bitcoin blocks?',        unit: 'MWU',   source: 'mempool.space', api: 'blockweight', type: 'bar', category: 'mempool'  },
  };

  // ─── EDITORIAL CONTENT ───────────────────────────────────────────
  const EDITORIAL = {
    'btc-price':        { measures: 'The spot price of Bitcoin in USD, volume-weighted across major exchanges.', importance: 'The most watched metric in Bitcoin. Price discovery reflects the aggregate conviction of every market participant — miners, holders, speculators, institutions.', update: 'After consolidating in the $95k–$105k range through Q1 2026, BTC broke above $108k in early July. The 200-day MA is now acting as support rather than resistance — a structural shift from the bear market regime.' },
    'hashrate':         { measures: 'Estimated total computational power in exahashes per second dedicated to mining Bitcoin blocks.', importance: 'Hashrate is the thermometer of miner conviction. Rising hashrate means miners are betting on Bitcoin\'s future — they\'ve committed capital months in advance.', update: 'Post-halving hashrate recovery has been faster than any previous cycle. The 812 EH/s reading reflects massive ASIC deployments in North America, the Gulf States, and parts of Latin America.' },
    'market-cap':       { measures: 'Total circulating supply × current price. A proxy for Bitcoin\'s weight relative to other global assets.', importance: 'Contextualizes Bitcoin within the broader asset landscape. Useful for macro comparisons, though not all BTC is liquid.', update: 'Bitcoin\'s market cap now exceeds $2 trillion, placing it firmly in the top 5 global assets by market value.' },
    'dominance':        { measures: 'Bitcoin\'s market cap as a percentage of the total cryptocurrency market.', importance: 'A proxy for capital rotation. Rising dominance signals risk-off behavior within crypto — capital fleeing altcoins back to BTC.', update: 'Dominance climbing to multi-year highs driven by ETF inflows that benefit BTC exclusively and general disillusionment with altcoin narratives.' },
    'volume':           { measures: 'Total spot trading volume aggregated across major exchanges over a rolling 24-hour window.', importance: 'Volume validates price moves. High volume on a breakout signals conviction; low volume on a rally signals fragility.', update: 'Volume trending higher since May, consistent with the price breakout above $105k. A significant share is now concentrated on regulated venues.' },
    'difficulty':       { measures: 'The target threshold that determines how hard it is to find a valid block hash. Recalibrates every ~2,016 blocks (~2 weeks).', importance: 'Difficulty is Bitcoin\'s self-regulating immune system. It ensures blocks arrive every ~10 minutes regardless of hashpower fluctuations.', update: 'Five consecutive positive adjustments signal sustained miner profitability despite the halved block subsidy. The difficulty ribbon has fully decompressed.' },
    'block-fees':       { measures: 'Average transaction fees included per block, in BTC.', importance: 'Tracks the critical transition from subsidy-dependent to fee-dependent miner security — one of Bitcoin\'s most important long-term metrics.', update: 'Fees represent 5–8% of miner revenue on average days, spiking to 15–20% during inscription or Runes activity. Still far from fee sustainability, but trajectory is encouraging.' },
    'mempool-size':     { measures: 'Total size of unconfirmed transactions waiting in the mempool, measured in virtual megabytes.', importance: 'The most immediate indicator of network congestion and fee pressure. A full mempool means fee competition is live.', update: 'The mempool has been oscillating between 20–60 MB through Q2 2026. No extreme congestion events since the Runes launch spike.' },
    'active-addresses': { measures: 'The number of unique Bitcoin addresses that appeared in at least one transaction on a given day.', importance: 'A rough proxy for network usage. Rising active addresses during price increases suggests organic demand rather than speculative leverage.', update: 'Active addresses crossed 1M/day in June — a threshold last seen during the 2021 bull market. Fewer exchange addresses, more self-custody and Lightning channel opens this time.' },
    'lth-supply':       { measures: 'Total Bitcoin held by addresses that haven\'t transacted in more than 155 days.', importance: 'Measures conviction. When LTH supply rises during price increases, it signals accumulation — not distribution.', update: 'Long-term holders now control over 75% of supply — the highest ratio ever recorded during an uptrend. Structurally different from 2021, where distribution began much earlier.' },
    'exchange-balance': { measures: 'Aggregate Bitcoin balance held across known exchange wallets.', importance: 'Declining exchange balances suggest coins moving to self-custody — a supply squeeze signal. Rising balances suggest potential sell pressure.', update: 'Exchange balances continue their multi-year decline. The ETF effect amplifies this: institutional buyers custody through regulated custodians, not exchange hot wallets.' },
    'nvt':              { measures: 'Market cap divided by daily on-chain transaction volume in USD. Think of it as a P/E ratio for Bitcoin.', importance: 'High NVT = the network is valued richly relative to usage. Low NVT = undervalued or usage is spiking.', update: 'NVT in the 60–75 range at this price level suggests the rally is fundamentally supported by on-chain activity, not pure speculation.' },
    'fee-rates':        { measures: 'The fee rate in sat/vB required to be included in the next block vs. lower priority tiers.', importance: 'Fee rates directly impact user experience. Understanding the distribution helps users choose the right fee for their urgency.', update: 'Fee rates have stabilized into a more predictable pattern than the chaotic 2024 Ordinals era. The spread between next-block and low-priority has narrowed.' },
    'tx-per-second':    { measures: 'Average number of on-chain transactions confirmed per second over a rolling 24-hour window.', importance: 'Bitcoin\'s base layer throughput is deliberately limited. This metric contextualizes the need for Layer 2 solutions.', update: 'Bitcoin consistently processes 5–7 tx/s on-chain — unchanged in years by design. This is precisely why Lightning, Ark, and other L2s exist.' },
    'block-weight':     { measures: 'Average weight of mined blocks in million weight units. Max is 4 MWU. Measures how full the available block space is.', importance: 'Consistently full blocks mean fee competition is structural, not temporary. Makes the block size debate concrete.', update: 'Blocks running at 96% capacity is the new normal. Between financial transactions, inscriptions, and protocol-level data, the 4 MWU limit is tested daily.' },
    'hashprice':        { measures: 'Estimated daily USD revenue a miner earns per terahash of computational power deployed.', importance: 'The single most important metric for miner economics. When hash price falls below production cost, capitulation follows.', update: 'Hash price bottomed at $0.035 in late 2025 and has recovered above the psychological $0.045 threshold. Miners running S21-class hardware are now comfortably profitable.' },
  };

  // ─── DATA CACHE ──────────────────────────────────────────────────
  const cache = {};
  const PERIOD_N = { '1D': 24, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, 'ALL': 730 };

  // ─── MOCK DATA GENERATOR ─────────────────────────────────────────
  function mockSeries(seed, length, base, amp, trend) {
    let val = base, s = seed;
    const now = Date.now();
    return Array.from({ length }, (_, i) => {
      s = (s * 9301 + 49297) % 233280;
      val += Math.sin(i * 0.5 + seed) * amp + trend;
      val = Math.max(base * 0.3, val);
      return { ts: now - (length - i) * 86400000, v: val };
    });
  }

  const MOCK = {
    price:      () => mockSeries(5,  365, 85000,  4000,  120),
    marketcap:  () => mockSeries(7,  365, 1.6e12, 8e10,  3e9),
    volume:     () => mockSeries(13, 365, 35e9,   8e9,   1e8),
    dominance:  () => mockSeries(6,  365, 55,     3,     0.02),
    hashrate:   () => mockSeries(3,  365, 600,    25,    0.6),
    difficulty: () => mockSeries(9,  52,  80,     5,     0.15),
    fees:       () => mockSeries(11, 90,  0.15,   0.05,  0.001),
    hashprice:  () => mockSeries(12, 180, 0.042,  0.008, 0.0001),
    addresses:  () => mockSeries(14, 365, 900,    80,    0.5),
    lth:        () => mockSeries(13, 365, 14.2,   0.3,   0.003),
    exchange:   () => mockSeries(15, 365, 2.8,   -0.04,  -0.001),
    nvt:        () => mockSeries(16, 365, 65,     8,     0.02),
    mempool:    () => mockSeries(17, 90,  35,     18,    0.05),
    feerates:   () => mockSeries(18, 90,  15,     10,    0.02),
    tps:        () => mockSeries(19, 90,  5.5,    1,     0.002),
    blockweight:() => mockSeries(20, 90,  3.7,    0.2,   0.001),
  };

  // ─── API FETCHERS ─────────────────────────────────────────────────
  async function fetchHashrate() {
    const r = await fetch('https://mempool.space/api/v1/mining/hashrate/1y');
    const j = await r.json();
    return j.hashrates.map(d => ({ ts: d.timestamp * 1000, v: d.avgHashrate / 1e18 }));
  }

  async function fetchMarket() {
    const r = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily');
    const j = await r.json();
    return { price: j.prices.map(([ts,v])=>({ts,v})), marketcap: j.market_caps.map(([ts,v])=>({ts,v:v/1e12})), volume: j.total_volumes.map(([ts,v])=>({ts,v:v/1e9})) };
  }

  async function fetchMempool() {
    const r = await fetch('https://mempool.space/api/mempool');
    const j = await r.json();
    return j;
  }

  async function fetchFees() {
    const r = await fetch('https://mempool.space/api/v1/fees/recommended');
    return r.json();
  }

  // ─── LOAD DATA ───────────────────────────────────────────────────
  async function loadData(apiKey) {
    if (cache[apiKey]) return { data: cache[apiKey], live: true };
    try {
      let data;
      if (apiKey === 'hashrate') data = await fetchHashrate();
      else if (['price','marketcap','volume'].includes(apiKey)) {
        if (!cache._market) cache._market = await fetchMarket();
        data = cache._market[apiKey];
      } else {
        throw new Error('no-live-api');
      }
      cache[apiKey] = data;
      return { data, live: true };
    } catch {
      const fn = MOCK[apiKey] || MOCK.price;
      return { data: fn(), live: false };
    }
  }

  function slicePeriod(data, period) {
    const n = PERIOD_N[period] || data.length;
    return data.slice(-Math.min(n, data.length));
  }

  // ─── FORMAT HELPERS ───────────────────────────────────────────────
  function fmtVal(v, unit) {
    if (unit === '$')    return v >= 1e6 ? `$${(v/1e3).toFixed(0)}k` : `$${v.toLocaleString('en-US',{maximumFractionDigits:0})}`;
    if (unit === '$T')   return `$${v.toFixed(2)}T`;
    if (unit === '$B')   return `$${v.toFixed(1)}B`;
    if (unit === 'EH/s') return `${v.toFixed(1)} EH/s`;
    if (unit === '%')    return `${v.toFixed(1)}%`;
    if (unit === 'M BTC') return `${v.toFixed(2)}M BTC`;
    if (unit === 'K')    return `${(v/1000).toFixed(0)}K`;
    return `${v.toFixed(2)}${unit ? ' '+unit : ''}`;
  }

  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // ─── SEEDED RANDOM (for consistent jitter) ────────────────────────
  function seededRand(seed) {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  // ─── SVG HELPERS ──────────────────────────────────────────────────
  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function smoothPath(pts, jitter = 0.8, seed = 1) {
    const rand = seededRand(seed);
    const j = pts.map(p => ({ x: p.x + (rand()-0.5)*jitter, y: p.y + (rand()-0.5)*jitter }));
    if (j.length < 2) return '';
    let d = `M${j[0].x.toFixed(2)},${j[0].y.toFixed(2)}`;
    for (let i = 0; i < j.length - 1; i++) {
      const p0 = j[Math.max(0,i-1)], p1 = j[i], p2 = j[i+1], p3 = j[Math.min(j.length-1,i+2)];
      const cp1x = p1.x + (p2.x-p0.x)/6, cp1y = p1.y + (p2.y-p0.y)/6;
      const cp2x = p2.x - (p3.x-p1.x)/6, cp2y = p2.y - (p3.y-p1.y)/6;
      d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  function sketchCircle(cx, cy, r) {
    const rand = seededRand(Math.round(cx+cy));
    const start = rand() * Math.PI;
    const pts = [];
    for (let a = 0; a <= Math.PI*2*1.15; a += 0.3) {
      const rr = r + (rand()-0.5)*1.5;
      pts.push(`${(cx+Math.cos(a+start)*rr).toFixed(1)},${(cy+Math.sin(a+start)*rr).toFixed(1)}`);
    }
    return 'M' + pts.join(' L');
  }

  // ─── MINI SPARKLINE (for gallery cards) ───────────────────────────
  function drawSparkline(container, data, type) {
    container.innerHTML = '';
    const W = container.offsetWidth || 220, H = 48;
    const vals = data.map(d => d.v);
    const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
    const toX = i => (i / (data.length - 1)) * W;
    const toY = v => H - ((v - min) / range) * (H - 6) - 3;

    const svg = svgEl('svg', { width: '100%', height: H, viewBox: `0 0 ${W} ${H}` });
    const defs = svgEl('defs');

    // gradient
    const grad = svgEl('linearGradient', { id: `sg-${container.dataset.chartId}`, x1:'0', y1:'0', x2:'0', y2:'1' });
    const s1 = svgEl('stop', { offset:'0%', 'stop-color': T.accent, 'stop-opacity':'0.2' });
    const s2 = svgEl('stop', { offset:'100%', 'stop-color': T.accent, 'stop-opacity':'0.01' });
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.appendChild(defs);

    if (type === 'bar') {
      const bw = Math.max(2, W / data.length - 1.5);
      data.forEach((d, i) => {
        const h = ((d.v - min) / range) * (H - 4);
        const x = (i / data.length) * W;
        const rect = svgEl('rect', { x, y: H - h - 2, width: bw, height: h, fill: i === data.length-1 ? T.accent : T.ink, rx: '1', opacity: '0.75' });
        svg.appendChild(rect);
      });
    } else {
      const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.v) }));
      const linePath = smoothPath(pts, 0.8, 42);
      const areaPath = `${linePath} L${toX(data.length-1)},${H} L0,${H} Z`;

      const area = svgEl('path', { d: areaPath, fill: `url(#sg-${container.dataset.chartId})` });
      svg.appendChild(area);

      // ink line
      const line = svgEl('path', { d: smoothPath(pts.slice(0, -8), 0.8, 5), fill:'none', stroke: T.ink, 'stroke-width':'1.5', 'stroke-linecap':'round' });
      svg.appendChild(line);

      // accent recent
      const accentLine = svgEl('path', { d: smoothPath(pts.slice(-9), 0.8, 9), fill:'none', stroke: T.accent, 'stroke-width':'2', 'stroke-linecap':'round' });
      svg.appendChild(accentLine);
    }
    container.appendChild(svg);
  }

  // ─── FULL CHART (for detail view) ────────────────────────────────
  function drawFullChart(container, data, cfg, period) {
    container.innerHTML = '';
    const W = 680, H = 380;
    const PAD = { top: 52, right: 20, bottom: 46, left: 52 };
    const CW = W - PAD.left - PAD.right;
    const CH = H - PAD.top - PAD.bottom;

    const sliced = slicePeriod(data, period);
    const vals = sliced.map(d => d.v);
    const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
    const toX = i => PAD.left + (i / (sliced.length - 1)) * CW;
    const toY = v => PAD.top + CH - ((v - min) / range) * CH;

    const svg = svgEl('svg', { width:'100%', viewBox:`0 0 ${W} ${H}`, style:'display:block' });
    const defs = svgEl('defs');

    // filters
    const roughF = svgEl('filter', { id:'ocm-rough', x:'-5%', y:'-5%', width:'110%', height:'110%' });
    const turb = svgEl('feTurbulence', { type:'fractalNoise', baseFrequency:'0.012', numOctaves:'2', seed:'4', result:'n' });
    const disp = svgEl('feDisplacementMap', { in:'SourceGraphic', in2:'n', scale:'2', xChannelSelector:'R', yChannelSelector:'G' });
    roughF.appendChild(turb); roughF.appendChild(disp); defs.appendChild(roughF);

    const dropF = svgEl('filter', { id:'ocm-drop', x:'-20%', y:'-20%', width:'140%', height:'140%' });
    const blur = svgEl('feGaussianBlur', { in:'SourceAlpha', stdDeviation:'3', result:'blur' });
    const offset = svgEl('feOffset', { in:'blur', dx:'2', dy:'4', result:'off' });
    const comp = svgEl('feComponentTransfer', { in:'off', result:'sh' });
    const funcA = svgEl('feFuncA', { type:'linear', slope:'0.28' });
    comp.appendChild(funcA);
    const merge = svgEl('feMerge');
    merge.appendChild(svgEl('feMergeNode', { in:'sh' }));
    merge.appendChild(svgEl('feMergeNode', { in:'SourceGraphic' }));
    dropF.appendChild(blur); dropF.appendChild(offset); dropF.appendChild(comp); dropF.appendChild(merge); defs.appendChild(dropF);

    // gradients
    const volGrad = svgEl('linearGradient', { id:'ocm-vol', x1:'0', y1:'0', x2:'0', y2:'1' });
    volGrad.appendChild(svgEl('stop', { offset:'0%', 'stop-color': T.ink, 'stop-opacity':'0.22' }));
    volGrad.appendChild(svgEl('stop', { offset:'100%', 'stop-color': T.ink, 'stop-opacity':'0.02' }));
    defs.appendChild(volGrad);

    const ridgeGrad = svgEl('linearGradient', { id:'ocm-ridge', x1:'0', y1:'0', x2:'0', y2:'1' });
    ridgeGrad.appendChild(svgEl('stop', { offset:'0%', 'stop-color':'#fff', 'stop-opacity':'0.35' }));
    ridgeGrad.appendChild(svgEl('stop', { offset:'15%', 'stop-color':'#fff', 'stop-opacity':'0' }));
    defs.appendChild(ridgeGrad);

    const clipRect = svgEl('clipPath', { id:'ocm-clip' });
    clipRect.appendChild(svgEl('rect', { x:PAD.left, y:PAD.top, width:CW, height:CH }));
    defs.appendChild(clipRect);

    svg.appendChild(defs);

    // background
    svg.appendChild(svgEl('rect', { width:W, height:H, fill:'transparent' }));

    // grid
    const GRID = 5;
    for (let i = 0; i <= GRID; i++) {
      const y = PAD.top + (i / GRID) * CH;
      const val = max - (i / GRID) * range;
      const rand = seededRand(i + 7);
      const line = svgEl('line', { x1:PAD.left, y1:y+(rand()-0.5)*1.2, x2:PAD.left+CW, y2:y+(rand()-0.5)*1.2, stroke:T.grid, 'stroke-width':'0.7', 'stroke-linecap':'round' });
      svg.appendChild(line);
      const label = svgEl('text', { x:PAD.left-8, y:y+4, 'text-anchor':'end', 'font-family':T.body, 'font-size':'10', fill:'rgba(128,128,128,0.55)', 'font-style':'italic' });
      label.textContent = val > 1e9 ? `${(val/1e9).toFixed(0)}B` : val > 1e6 ? `${(val/1e6).toFixed(0)}M` : val.toFixed(1);
      svg.appendChild(label);
    }
    // baseline
    const rand0 = seededRand(99);
    svg.appendChild(svgEl('line', { x1:PAD.left, y1:PAD.top+CH+(rand0()-0.5), x2:PAD.left+CW, y2:PAD.top+CH+(rand0()-0.5), stroke:'rgba(128,128,128,0.3)', 'stroke-width':'1', 'stroke-linecap':'round' }));

    // x labels
    const tickIdxs = [0, 0.25, 0.5, 0.75, 1];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    tickIdxs.forEach(t => {
      const idx = Math.round(t * (sliced.length - 1));
      const x = PAD.left + t * CW;
      const mo = new Date(sliced[idx]?.ts || Date.now()).getMonth();
      const lbl = svgEl('text', { x, y:PAD.top+CH+18, 'text-anchor':'middle', 'font-family':T.body, 'font-size':'10', fill:'rgba(128,128,128,0.5)', 'font-style':'italic' });
      lbl.textContent = MONTHS[mo];
      svg.appendChild(lbl);
    });

    if (cfg.type === 'bar') {
      const gap = 3;
      const bw = (CW - gap * (sliced.length - 1)) / sliced.length;
      const g = svgEl('g', { filter:'url(#ocm-rough)' });
      sliced.forEach((d, i) => {
        const h = ((d.v - min) / range) * CH;
        const x = PAD.left + i * (bw + gap);
        const y = PAD.top + CH - h;
        const isLast = i === sliced.length - 1;
        const barG = svgEl('g', { filter:'url(#ocm-drop)' });

        const barGrad = svgEl('linearGradient', { id:`ocm-bv-${i}`, x1:'0', y1:'0', x2:'0', y2:'1' });
        barGrad.appendChild(svgEl('stop', { offset:'0%', 'stop-color': isLast ? T.accent : T.ink, 'stop-opacity': isLast ? '1' : '0.85' }));
        barGrad.appendChild(svgEl('stop', { offset:'100%', 'stop-color': isLast ? T.accent : T.ink, 'stop-opacity': isLast ? '0.75' : '0.6' }));
        defs.appendChild(barGrad);

        barG.appendChild(svgEl('rect', { x, y, width:bw, height:h, rx:'1.5', fill:`url(#ocm-bv-${i})` }));
        barG.appendChild(svgEl('rect', { x, y, width:bw, height:Math.min(h,16), rx:'1.5', fill:'rgba(255,255,255,0.3)' }));
        g.appendChild(barG);
      });
      svg.appendChild(g);
    } else {
      // area + line
      const pts = sliced.map((d, i) => ({ x: toX(i), y: toY(d.v) }));
      const linePath = smoothPath(pts, 1.0, 3);
      const areaPath = `${linePath} L${toX(sliced.length-1)},${PAD.top+CH} L${PAD.left},${PAD.top+CH} Z`;

      const areaG = svgEl('g', { 'clip-path':'url(#ocm-clip)' });
      areaG.appendChild(svgEl('path', { d:areaPath, fill:'url(#ocm-vol)' }));
      areaG.appendChild(svgEl('path', { d:areaPath, fill:'url(#ocm-ridge)' }));
      svg.appendChild(areaG);

      const curveG = svgEl('g', { filter:'url(#ocm-rough)', 'clip-path':'url(#ocm-clip)' });
      const mainLine = svgEl('path', { d:linePath, fill:'none', stroke:T.ink, 'stroke-width':'2.2', 'stroke-linecap':'round', 'stroke-linejoin':'round', filter:'url(#ocm-drop)' });
      curveG.appendChild(mainLine);

      if (pts.length > 12) {
        const accentLine = svgEl('path', { d:smoothPath(pts.slice(-12), 1.0, 4), fill:'none', stroke:T.accent, 'stroke-width':'2.5', 'stroke-linecap':'round', filter:'url(#ocm-drop)' });
        curveG.appendChild(accentLine);
      }
      svg.appendChild(curveG);

      // end dot
      const last = pts[pts.length-1];
      if (last) {
        svg.appendChild(svgEl('circle', { cx:last.x, cy:last.y, r:'4', fill:T.accent }));
        svg.appendChild(svgEl('path', { d:sketchCircle(last.x, last.y, 9), fill:'none', stroke:T.accent, 'stroke-width':'1.2', opacity:'0.6', 'stroke-linecap':'round' }));
      }

      // hover overlay
      const hoverLine = svgEl('line', { x1:0, y1:PAD.top, x2:0, y2:PAD.top+CH, stroke:T.accent, 'stroke-width':'0.7', 'stroke-dasharray':'3,3', opacity:'0', 'pointer-events':'none' });
      svg.appendChild(hoverLine);

      const tooltipG = svgEl('g', { opacity:'0', 'pointer-events':'none' });
      const ttBox = svgEl('rect', { x:0, y:0, width:130, height:42, rx:'2', fill:T.ink });
      const ttDate = svgEl('text', { x:10, y:14, 'font-family':T.body, 'font-size':'10', fill:'rgba(255,255,255,0.55)', 'font-style':'italic' });
      const ttVal = svgEl('text', { x:10, y:32, 'font-family':T.heading, 'font-size':'14', 'font-weight':'600', fill:'#fff' });
      tooltipG.appendChild(ttBox); tooltipG.appendChild(ttDate); tooltipG.appendChild(ttVal);
      svg.appendChild(tooltipG);

      const hitArea = svgEl('rect', { x:PAD.left, y:PAD.top, width:CW, height:CH, fill:'transparent', style:'cursor:crosshair' });
      hitArea.addEventListener('mousemove', e => {
        const svgRect = svg.getBoundingClientRect();
        const scaleX = W / svgRect.width;
        const mx = (e.clientX - svgRect.left) * scaleX;
        let nearest = pts[0], nearD = Infinity;
        pts.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < nearD) { nearD = d; nearest = { ...p, d: sliced[i] }; } });
        if (!nearest.d) return;
        hoverLine.setAttribute('x1', nearest.x); hoverLine.setAttribute('x2', nearest.x); hoverLine.setAttribute('opacity', '0.5');
        const tx = Math.min(nearest.x + 8, W - 140);
        const ty = Math.max(nearest.y - 52, PAD.top);
        ttBox.setAttribute('x', tx); ttBox.setAttribute('y', ty);
        ttDate.setAttribute('x', tx+10); ttDate.setAttribute('y', ty+14);
        ttVal.setAttribute('x', tx+10); ttVal.setAttribute('y', ty+32);
        ttDate.textContent = fmtDate(nearest.d.ts);
        ttVal.textContent = fmtVal(nearest.d.v, cfg.unit);
        tooltipG.setAttribute('opacity', '1');
      });
      hitArea.addEventListener('mouseleave', () => { hoverLine.setAttribute('opacity','0'); tooltipG.setAttribute('opacity','0'); });
      svg.appendChild(hitArea);
    }

    // watermark
    const wm = svgEl('text', { x:W/2, y:PAD.top+CH/2+8, 'text-anchor':'middle', 'font-family':T.heading, 'font-size':'18', 'font-weight':'600', fill:T.ink, opacity:'0.04', 'letter-spacing':'0.18em' });
    wm.textContent = 'OFF-CHAIN MEDIA';
    svg.appendChild(wm);

    // footer
    svg.appendChild(svgEl('line', { x1:0, y1:H-14, x2:W, y2:H-14, stroke:T.ink, 'stroke-width':'0.5', opacity:'0.3' }));
    const src = svgEl('text', { x:PAD.left, y:H-4, 'font-family':T.body, 'font-size':'9', fill:'rgba(128,128,128,0.4)', 'font-style':'italic' });
    src.textContent = `Source: ${cfg.source}`;
    svg.appendChild(src);
    const url = svgEl('text', { x:W-PAD.right, y:H-4, 'text-anchor':'end', 'font-family':T.heading, 'font-size':'8', fill:'rgba(128,128,128,0.35)', 'letter-spacing':'0.1em' });
    url.textContent = 'OFFCHAIN.MEDIA/DATA';
    svg.appendChild(url);

    container.appendChild(svg);
  }

  // ─── STATE ────────────────────────────────────────────────────────
  let currentChartId = null;
  let currentPeriod = '1Y';
  let currentData = null;
  let currentCfg = null;

  // ─── GALLERY VIEW ─────────────────────────────────────────────────
  const galleryView = document.querySelector('.ocm-gallery-view');
  const detailView  = document.querySelector('.ocm-detail-view');

  function showGallery() {
    if (galleryView) galleryView.style.display = '';
    if (detailView)  detailView.style.display = 'none';
    currentChartId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showDetail(chartId) {
    if (!CATALOG[chartId]) return;
    currentChartId = chartId;
    currentPeriod = '1Y';
    if (galleryView) galleryView.style.display = 'none';
    if (detailView)  detailView.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderDetail(chartId, currentPeriod);
  }

  async function renderDetail(chartId, period) {
    const cfg = CATALOG[chartId];
    const ed  = EDITORIAL[chartId] || {};
    if (!cfg || !detailView) return;

    // breadcrumb
    const catEl = detailView.querySelector('.ocm-breadcrumb-cat');
    if (catEl) catEl.textContent = cfg.category.replace('-',' ').toUpperCase();

    // title
    const titleEl = detailView.querySelector('.ocm-detail-title');
    if (titleEl) titleEl.textContent = cfg.title;

    const subEl = detailView.querySelector('.ocm-detail-subtitle');
    if (subEl) subEl.textContent = cfg.subtitle;

    // editorial
    const measEl = detailView.querySelector('.ocm-measures-text');
    if (measEl) measEl.textContent = ed.measures || '';
    const impEl = detailView.querySelector('.ocm-importance-text');
    if (impEl) impEl.textContent = ed.importance || '';
    const editEl = detailView.querySelector('.ocm-editorial-text');
    if (editEl) editEl.textContent = ed.update || '';

    // signature date
    const sigDate = detailView.querySelector('.ocm-sig-date');
    if (sigDate) sigDate.textContent = `Last updated ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`;

    // period buttons
    detailView.querySelectorAll('.ocm-period-btn').forEach(btn => {
      btn.classList.toggle('ocm-period-active', btn.dataset.period === period);
    });

    // load data
    const readingEl = detailView.querySelector('.ocm-reading-value');
    if (readingEl) readingEl.textContent = 'Loading…';

    const chartEl = detailView.querySelector('.ocm-detail-chart');
    if (chartEl) chartEl.innerHTML = '<p style="padding:20px;font-family:Spectral,serif;color:rgba(128,128,128,0.5);font-style:italic;">Loading chart…</p>';

    const { data, live } = await loadData(cfg.api);
    currentData = data;
    currentCfg = cfg;

    const sliced = slicePeriod(data, period);
    const last = sliced[sliced.length - 1];
    if (readingEl && last) readingEl.textContent = fmtVal(last.v, cfg.unit) + (live ? '' : ' (demo)');

    if (chartEl) drawFullChart(chartEl, data, cfg, period);

    // related charts
    const relGrid = detailView.querySelector('.ocm-related-grid');
    if (relGrid) {
      relGrid.innerHTML = '';
      Object.entries(CATALOG)
        .filter(([id, c]) => c.category === cfg.category && id !== chartId)
        .slice(0, 4)
        .forEach(([id, c]) => {
          const div = document.createElement('div');
          div.style.cssText = 'background:var(--dark--background,#1a1a1a);padding:14px 16px;cursor:pointer;';
          div.innerHTML = `<h3 style="font-family:Oswald,sans-serif;font-size:14px;font-weight:500;margin:0 0 4px;color:var(--dark--text,#fff)">${c.title}</h3><p style="font-size:12px;color:rgba(128,128,128,0.5);margin:0;font-style:italic;font-family:Spectral,serif">${c.subtitle}</p>`;
          div.addEventListener('click', () => showDetail(id));
          div.addEventListener('mouseenter', () => div.style.background = 'rgba(128,128,128,0.1)');
          div.addEventListener('mouseleave', () => div.style.background = 'var(--dark--background,#1a1a1a)');
          relGrid.appendChild(div);
        });
    }
  }

  // ─── INIT GALLERY CARDS ───────────────────────────────────────────
  async function initCards() {
    // Prefetch market data once
    try { if (!cache._market) cache._market = await fetchMarket(); } catch {}

    const cards = document.querySelectorAll('.ocm-card');
    for (const card of cards) {
      const chartId = card.dataset.chartId;
      if (!chartId || !CATALOG[chartId]) continue;
      const cfg = CATALOG[chartId];

      // click
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => showDetail(chartId));

      // mini chart
      const chartDiv = card.querySelector('.ocm-card-chart');
      if (chartDiv) {
        chartDiv.dataset.chartId = chartId;
        const { data } = await loadData(cfg.api);
        const sliced = slicePeriod(data, '3M');
        drawSparkline(chartDiv, sliced, cfg.type);

        // reading
        const readingEl = card.querySelector('.ocm-card-reading');
        const last = sliced[sliced.length - 1];
        if (readingEl && last) readingEl.textContent = fmtVal(last.v, cfg.unit);
      }
    }
  }

  // ─── CATEGORY FILTERS ─────────────────────────────────────────────
  function initFilters() {
    const btns = document.querySelectorAll('.ocm-filter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('ocm-filter-active'));
        btn.classList.add('ocm-filter-active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.ocm-category-section').forEach(sec => {
          sec.style.display = (filter === 'all' || sec.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  }

  // ─── PERIOD SELECTOR ──────────────────────────────────────────────
  function initPeriodBtns() {
    document.querySelectorAll('.ocm-period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPeriod = btn.dataset.period;
        if (currentChartId) renderDetail(currentChartId, currentPeriod);
      });
    });
  }

  // ─── BACK BUTTON ─────────────────────────────────────────────────
  function initBackBtn() {
    const backBtn = document.querySelector('.ocm-back-btn');
    if (backBtn) backBtn.addEventListener('click', showGallery);
  }

  // ─── BOOT ─────────────────────────────────────────────────────────
  function boot() {
    initFilters();
    initPeriodBtns();
    initBackBtn();
    initCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
