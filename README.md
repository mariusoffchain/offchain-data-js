# offchain-data-js

JavaScript bundle for the [Off-Chain Media](https://offchain.media) Bitcoin Data Library (`/data`).

## Structure

```
src/
├── main.js          ← Entry point. Boots gallery + wires navigation.
├── catalog.js       ← All 16 chart definitions (id, title, type, api, unit…)
├── editorial.js     ← Editorial content per chart (measures, importance, monthly update)
├── tokens.js        ← Design tokens (colors, fonts) — never hardcode elsewhere
├── data.js          ← API fetchers + mock fallback + formatting helpers
├── drawing.js       ← Pure SVG helpers (smooth paths, jitter, sketch circle)
├── charts/
│   ├── sparkline.js ← Mini chart for gallery cards (~48px tall)
│   └── fullchart.js ← Full interactive chart for detail view (line/area/bar + tooltip)
└── ui/
    ├── gallery.js   ← Gallery view: card init, sparklines, filter tabs
    └── detail.js    ← Detail view: full chart, editorial, period selector, related charts
dist/
└── offchain-data.bundle.js  ← Compiled bundle — this is what Webflow loads
```

## Setup

```bash
npm install
npm run build
# → dist/offchain-data.bundle.js
```

## Workflow

1. Edit files in `src/`
2. Run `npm run build`
3. Commit and push — GitHub Pages serves the new bundle automatically
4. Webflow loads it via:
   ```html
   <script src="https://mariusoffchain.github.io/offchain-data-js/dist/offchain-data.bundle.js" defer></script>
   ```

## Adding a new chart

1. Add an entry to `src/catalog.js`
2. Add editorial text to `src/editorial.js`
3. If needed, add a fetcher to `src/data.js`
4. Add a card with `data-chart-id="your-id"` to the Webflow page HTML
5. Run `npm run build`

## Adding live API data

All live data is in `src/data.js`. To add a new source:

```js
// 1. Write a fetcher
async function fetchMyMetric() {
  const r = await fetch('https://api.example.com/metric');
  const j = await r.json();
  return j.data.map(d => ({ ts: d.time * 1000, v: d.value }));
}

// 2. Add to FETCHERS map
const FETCHERS = {
  // ...existing
  mymetric: fetchMyMetric,
};
```

The mock fallback kicks in automatically if the fetch fails.

## CoinGecko API key

The free CoinGecko tier returns cached data. For live prices:

1. Get a free key at [coingecko.com/en/api](https://www.coingecko.com/en/api)
2. In `src/data.js`, replace the fetch URL in `fetchMarketChart()`:
   ```js
   const r = await fetch(`https://pro-api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily&x_cg_pro_api_key=${YOUR_KEY}`);
   ```

## Design tokens

All colors and fonts are in `src/tokens.js`. Never hardcode `#F7931A` or font names elsewhere.

| Token    | Value       | Usage                          |
|----------|-------------|--------------------------------|
| `accent` | `#F7931A`   | Bitcoin orange — never changed |
| `ink`    | `#1a1a1a`   | Near-black text and lines      |
| `paper`  | `#FAF7F1`   | Warm background                |
| `muted`  | `rgba(...)`  | Secondary text                 |
| `heading`| Oswald      | Titles, labels, uppercase      |
| `body`   | Spectral    | Body text, axis labels         |
