/**
 * Block explorer strip — mempool.space-style row of projected +
 * confirmed blocks, drawn as our own SVG cubes (not their code: only
 * their public API is consumed, avoiding both an Angular/RxJS
 * dependency and any AGPL entanglement).
 *
 * Cube faces are three polygons sharing exact vertices, so corners
 * always line up regardless of card size (no CSS skew/transform
 * approximation).
 *
 * Layout: one continuous horizontally-scrolling row — pending blocks,
 * a static pickaxe divider, confirmed blocks — matching mempool.space
 * (a single strip, not two independently-scrollable halves).
 */

import { svgEl } from '../drawing.js';
import { T } from '../tokens.js';
import { loadMempoolBlocks, loadRecentBlocks, fmtTimeAgo } from '../data.js';

const REFRESH_MS = 45_000;
const DEPTH = 10; // cube bevel depth, in the 0-100 viewBox unit

let lastPending   = [];
let lastConfirmed = [];

export function initBlockStrip() {
  const host = document.querySelector('.ocm-data-hero') || document.querySelector('.ocm-gallery-view');
  if (!host || !host.parentElement) return;

  const strip = document.createElement('div');
  strip.className = 'ocm-blockstrip';
  host.parentElement.insertBefore(strip, host);

  const fetchAndRender = async () => {
    const [{ data: pending }, { data: confirmed }] = await Promise.all([
      loadMempoolBlocks(),
      loadRecentBlocks(),
    ]);
    lastPending   = pending.slice(0, 3).map((b, i) => ({ ...b, _index: i }));
    lastConfirmed = confirmed.slice(0, 15);
    _render(strip);
  };

  fetchAndRender();
  setInterval(fetchAndRender, REFRESH_MS);
}

function _render(strip) {
  strip.innerHTML = '';

  // Soonest pending block (index 0) sits last, i.e. closest to the
  // divider; confirmed API order is already newest-first, so the most
  // recent block sits right after the divider on the other side.
  [...lastPending].reverse().forEach(b => {
    strip.appendChild(_cube('pending', {
      fee: b.medianFee, range: b.feeRange, fees: b.totalFees,
      txs: b.nTx, size: b.blockSize, meta: `in ~${(b._index + 1) * 10} min`,
    }));
  });

  const divider = document.createElement('div');
  divider.className = 'ocm-blockstrip-divider';
  divider.appendChild(_pickaxeIcon());
  strip.appendChild(divider);

  lastConfirmed.forEach(b => {
    strip.appendChild(_cube('confirmed', {
      fee: b.extras.medianFee, range: b.extras.feeRange, fees: b.extras.totalFees,
      txs: b.tx_count, size: b.size,
      meta: `${b.height.toLocaleString('en-US')} · ${fmtTimeAgo(b.timestamp)} · ${b.extras.pool.name}`,
    }));
  });

  strip.appendChild(_explorerLink());
}

function _pickaxeIcon() {
  const svg = svgEl('svg', {
    viewBox: '0 0 750 750', width: '32', height: '32',
    fill: 'currentColor',
  });
  svg.appendChild(svgEl('path', { d: 'M 99.796875 337.5 C 75.007812 403.238281 76.148438 464.222656 83.519531 508.835938 C 96.296875 463.699219 114.085938 420.121094 136.539062 379.023438 C 156.53125 342.421875 180.320312 307.730469 207.234375 275.769531 L 162.644531 234.496094 C 135.257812 265.027344 114.082031 299.625 99.796875 337.5 Z' }));
  svg.appendChild(svgEl('path', { d: 'M 378.777344 136.789062 C 419.863281 114.347656 463.441406 96.550781 508.597656 83.761719 C 463.976562 76.394531 402.984375 75.257812 337.257812 100.042969 C 299.386719 114.320312 264.789062 135.496094 234.253906 162.890625 L 275.523438 207.480469 C 307.484375 180.566406 342.183594 156.769531 378.777344 136.789062 Z' }));
  svg.appendChild(svgEl('path', { d: 'M 667.679688 641.664062 L 289.960938 263.953125 L 263.707031 290.210938 L 641.425781 667.921875 C 648.433594 674.9375 660.664062 674.9375 667.683594 667.921875 C 674.917969 660.683594 674.917969 648.902344 667.679688 641.664062 Z' }));
  svg.appendChild(svgEl('path', { d: 'M 209.78125 150.789062 C 192.59375 156.628906 180.5 166.261719 173.257812 173.503906 C 160.660156 186.101562 154.011719 199.859375 150.546875 210.027344 L 165.585938 223.949219 L 243.804688 296.335938 L 253.375 286.761719 L 296.09375 244.039062 Z' }));
  return svg;
}

function _explorerLink() {
  const wrap = document.createElement('a');
  wrap.className = 'ocm-block-cube ocm-block-explorer';
  wrap.href = 'https://mempool.space';
  wrap.target = '_blank';
  wrap.rel = 'noopener noreferrer';

  const svg = svgEl('svg', {
    class: 'ocm-block-cube-bg',
    viewBox: '0 0 100 100',
    preserveAspectRatio: 'none',
  });
  const s = T.textAdaptive;
  svg.appendChild(svgEl('polygon', {
    points: `0,${DEPTH} ${DEPTH},0 100,0 ${100 - DEPTH},${DEPTH}`,
    style: `fill:none; stroke:${s}; stroke-width:0.7; opacity:0.5;`,
  }));
  svg.appendChild(svgEl('polygon', {
    points: `${100 - DEPTH},${DEPTH} 100,0 100,${100 - DEPTH} ${100 - DEPTH},100`,
    style: `fill:none; stroke:${s}; stroke-width:0.7; opacity:0.5;`,
  }));
  svg.appendChild(svgEl('polygon', {
    points: `0,${DEPTH} ${100 - DEPTH},${DEPTH} ${100 - DEPTH},100 0,100`,
    style: `fill:none; stroke:${s}; stroke-width:0.7; stroke-dasharray:3,3; opacity:0.5;`,
  }));
  wrap.appendChild(svg);

  const content = document.createElement('div');
  content.className = 'ocm-block-explorer-content';
  content.innerHTML = `
    <p style="font-family:${T.heading};font-size:13px;font-weight:600;color:${T.textAdaptive};margin:0 0 4px;opacity:0.5;">Explorer</p>
    <p style="font-family:${T.heading};font-size:15px;font-weight:600;color:${T.textAdaptive};margin:0;">mempool</p>
    <p style="font-family:${T.heading};font-size:15px;font-weight:600;color:${T.accent};margin:0;">.space →</p>
  `;
  wrap.appendChild(content);

  return wrap;
}

function _cube(kind, d) {
  const wrap = document.createElement('div');
  wrap.className = `ocm-block-cube ocm-block-cube--${kind}`;

  const isConfirmed = kind === 'confirmed';
  const front  = isConfirmed ? T.textAdaptive : 'none';
  const stroke = T.textAdaptive;

  const svg = svgEl('svg', {
    class: 'ocm-block-cube-bg',
    viewBox: '0 0 100 100',
    preserveAspectRatio: 'none',
  });
  svg.appendChild(svgEl('polygon', {
    points: `0,${DEPTH} ${DEPTH},0 100,0 ${100 - DEPTH},${DEPTH}`,
    style: `fill: ${isConfirmed ? T.textAdaptive : 'none'}; opacity: ${isConfirmed ? '0.8' : '1'}; stroke: ${stroke}; stroke-width: 1;`,
  }));
  svg.appendChild(svgEl('polygon', {
    points: `${100 - DEPTH},${DEPTH} 100,0 100,${100 - DEPTH} ${100 - DEPTH},100`,
    style: `fill: ${isConfirmed ? T.textAdaptive : 'none'}; opacity: ${isConfirmed ? '0.6' : '1'}; stroke: ${stroke}; stroke-width: 1;`,
  }));
  svg.appendChild(svgEl('polygon', {
    points: `0,${DEPTH} ${100 - DEPTH},${DEPTH} ${100 - DEPTH},100 0,100`,
    style: `fill: ${front}; stroke: ${stroke}; stroke-width: 1;`,
  }));
  wrap.appendChild(svg);

  const content = document.createElement('div');
  content.className = 'ocm-block-cube-content';
  const min = d.range[0];
  const max = d.range[d.range.length - 1];
  content.innerHTML = `
    <p class="ocm-bc-fee">~${Math.round(d.fee)} sat/vB</p>
    <p class="ocm-bc-range">${min.toFixed(2)} - ${max.toFixed(0)} sat/vB</p>
    <div class="ocm-bc-row"><span>Total fees</span><span>${(d.fees / 1e8).toFixed(3)} BTC</span></div>
    <div class="ocm-bc-row"><span>Transactions</span><span>${d.txs.toLocaleString('en-US')}</span></div>
    <div class="ocm-bc-row"><span>Size</span><span>${(d.size / 1e6).toFixed(1)} MB</span></div>
    <p class="ocm-bc-meta">${d.meta}</p>
  `;
  wrap.appendChild(content);

  return wrap;
}
