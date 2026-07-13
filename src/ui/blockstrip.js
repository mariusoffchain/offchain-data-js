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
 * Layout: two equal-width panes (pending / confirmed) each scroll
 * independently, so the divider between them always sits at the
 * horizontal center of the strip regardless of how many blocks are
 * on either side.
 */

import { svgEl } from '../drawing.js';
import { T } from '../tokens.js';
import { loadMempoolBlocks, loadRecentBlocks, fmtTimeAgo } from '../data.js';

const REFRESH_MS = 45_000;
const DEPTH = 10; // cube bevel depth, in the 0-100 viewBox unit

let lastPending   = [];
let lastConfirmed = [];
let reversed      = false;

export function initBlockStrip() {
  const host = document.querySelector('.ocm-data-hero') || document.querySelector('.ocm-gallery-view');
  if (!host || !host.parentElement) return;

  const strip = document.createElement('div');
  strip.className = 'ocm-blockstrip';

  const pendingPane = document.createElement('div');
  pendingPane.className = 'ocm-blockstrip-pane ocm-blockstrip-pane--pending';

  const divider = document.createElement('div');
  divider.className = 'ocm-blockstrip-divider';
  divider.title = 'Reverse order';
  divider.addEventListener('click', () => {
    reversed = !reversed;
    _render(pendingPane, confirmedPane);
  });

  const confirmedPane = document.createElement('div');
  confirmedPane.className = 'ocm-blockstrip-pane ocm-blockstrip-pane--confirmed';

  strip.appendChild(pendingPane);
  strip.appendChild(divider);
  strip.appendChild(confirmedPane);
  host.parentElement.insertBefore(strip, host);

  const fetchAndRender = async () => {
    const [{ data: pending }, { data: confirmed }] = await Promise.all([
      loadMempoolBlocks(),
      loadRecentBlocks(),
    ]);
    lastPending   = pending.slice(0, 3).map((b, i) => ({ ...b, _index: i }));
    lastConfirmed = confirmed.slice(0, 8);
    _render(pendingPane, confirmedPane);
  };

  fetchAndRender();
  setInterval(fetchAndRender, REFRESH_MS);
}

function _render(pendingPane, confirmedPane) {
  pendingPane.innerHTML   = '';
  confirmedPane.innerHTML = '';

  // minutesOut reflects each block's real queue position (index 0 =
  // next), computed before any reorder — not the display slot, so the
  // ETA stays correct regardless of which end faces the divider.
  const pendingOrdered = reversed ? [...lastPending] : [...lastPending].reverse();
  pendingOrdered.forEach(b => {
    pendingPane.appendChild(_cube('pending', {
      fee: b.medianFee, range: b.feeRange, fees: b.totalFees,
      txs: b.nTx, size: b.blockSize, meta: `in ~${(b._index + 1) * 10} min`,
    }));
  });

  const confirmedOrdered = reversed ? [...lastConfirmed].reverse() : lastConfirmed;
  confirmedOrdered.forEach(b => {
    confirmedPane.appendChild(_cube('confirmed', {
      fee: b.extras.medianFee, range: b.extras.feeRange, fees: b.extras.totalFees,
      txs: b.tx_count, size: b.size,
      meta: `${b.height.toLocaleString('en-US')} · ${fmtTimeAgo(b.timestamp)} · ${b.extras.pool.name}`,
    }));
  });
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
