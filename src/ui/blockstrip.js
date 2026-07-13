/**
 * Block explorer strip — mempool.space-style row of projected +
 * confirmed blocks, drawn as our own SVG cubes (not their code: only
 * their public API is consumed, avoiding both an Angular/RxJS
 * dependency and any AGPL entanglement).
 *
 * Cube faces are three polygons sharing exact vertices, so corners
 * always line up regardless of card size (no CSS skew/transform
 * approximation).
 */

import { svgEl } from '../drawing.js';
import { T } from '../tokens.js';
import { loadMempoolBlocks, loadRecentBlocks, fmtTimeAgo } from '../data.js';

const REFRESH_MS = 45_000;
const DEPTH = 10; // cube bevel depth, in the 0-100 viewBox unit

export function initBlockStrip() {
  const host = document.querySelector('.ocm-data-hero') || document.querySelector('.ocm-gallery-view');
  if (!host || !host.parentElement) return;

  const strip = document.createElement('div');
  strip.className = 'ocm-blockstrip';
  host.parentElement.insertBefore(strip, host);

  const render = () => _refresh(strip);
  render();
  setInterval(render, REFRESH_MS);
}

async function _refresh(strip) {
  const [{ data: pending }, { data: confirmed }] = await Promise.all([
    loadMempoolBlocks(),
    loadRecentBlocks(),
  ]);

  strip.innerHTML = '';

  pending.slice(0, 3).reverse().forEach((b, i, arr) => {
    const minutesOut = (arr.length - i) * 10;
    strip.appendChild(_cube('pending', {
      fee:    b.medianFee,
      range:  b.feeRange,
      fees:   b.totalFees,
      txs:    b.nTx,
      size:   b.blockSize,
      meta:   `in ~${minutesOut} min`,
    }));
  });

  const divider = document.createElement('div');
  divider.className = 'ocm-blockstrip-divider';
  divider.title = 'Reverse order';
  divider.addEventListener('click', () => {
    strip.classList.toggle('ocm-blockstrip--reversed');
  });
  strip.appendChild(divider);

  confirmed.slice(0, 8).forEach(b => {
    strip.appendChild(_cube('confirmed', {
      fee:   b.extras.medianFee,
      range: b.extras.feeRange,
      fees:  b.extras.totalFees,
      txs:   b.tx_count,
      size:  b.size,
      meta:  `${b.height.toLocaleString('en-US')} · ${fmtTimeAgo(b.timestamp)} · ${b.extras.pool.name}`,
    }));
  });
}

function _cube(kind, d) {
  const wrap = document.createElement('div');
  wrap.className = `ocm-block-cube ocm-block-cube--${kind}`;

  const isConfirmed = kind === 'confirmed';
  const front = isConfirmed ? T.textAdaptive : 'none';
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
