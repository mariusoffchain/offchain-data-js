/**
 * Full Chart — large interactive SVG for the detail view.
 * Style: relief/pencil — drop shadow, volume gradient, wobbly edges.
 * Supports: line, area, bar types.
 * Features: hover tooltip, crosshair, period-aware.
 */

import { svgEl, smoothPath, sketchCircle, dataToPoints } from '../drawing.js';
import { slicePeriod, fmtVal, fmtValTooltip, fmtDate } from '../data.js';
import { T } from '../tokens.js';

// Chart canvas constants
const W   = 680;
const H   = 380;
const PAD = { top: 52, right: 20, bottom: 46, left: 52 };
const CW  = W - PAD.left - PAD.right;
const CH  = H - PAD.top  - PAD.bottom;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const GRID_N = 5;
let _wmId = 0;

const SOURCE_URLS = {
  'Coin Metrics':  'https://coinmetrics.io',
  'mempool.space': 'https://mempool.space',
  'CoinGecko':     'https://www.coingecko.com',
};

// ── Private: horizontal ranking chart (snapshot data with labels) ──
function _drawFullRanking(container, data, cfg) {
  const svg  = svgEl('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, style: 'display:block' });
  const defs = svgEl('defs');

  const dropF  = svgEl('filter', { id: 'ocm-drop', x: '-20%', y: '-20%', width: '140%', height: '140%' });
  const fBlur  = svgEl('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '3', result: 'blur' });
  const fOff   = svgEl('feOffset', { in: 'blur', dx: '2', dy: '4', result: 'off' });
  const fFlood = svgEl('feFlood', { style: `flood-color: ${T.shadow}`, result: 'floodColor' });
  const fComp  = svgEl('feComposite', { in: 'floodColor', in2: 'off', operator: 'in', result: 'sh' });
  const fMerge = svgEl('feMerge');
  fMerge.appendChild(svgEl('feMergeNode', { in: 'sh' }));
  fMerge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  dropF.appendChild(fBlur); dropF.appendChild(fOff); dropF.appendChild(fFlood);
  dropF.appendChild(fComp); dropF.appendChild(fMerge);
  defs.appendChild(dropF);
  svg.appendChild(defs);
  svg.appendChild(svgEl('rect', { width: W, height: H, fill: 'transparent' }));

  const LPAD   = 152;
  const RPAD   = 80;
  const barW   = W - LPAD - RPAD;
  const sorted = [...data].sort((a, b) => b.v - a.v).slice(0, 15);
  const maxV   = Math.max(...sorted.map(d => d.v));
  const itemH  = (H - PAD.top - PAD.bottom) / Math.max(sorted.length, 1);
  const bh     = Math.max(4, Math.min(20, itemH * 0.6));

  sorted.forEach((d, i) => {
    const barLen  = maxV > 0 ? (d.v / maxV) * barW : 0;
    const cy      = PAD.top + i * itemH + itemH / 2;
    const isTop   = i === 0;
    const barClr  = isTop ? T.accent : T.line;
    const lblFill = isTop ? T.accent : 'rgba(200,200,200,0.82)';

    // Rank number
    const rank = svgEl('text', { x: 6, y: cy + 4, 'font-family': T.body, 'font-size': '10', fill: 'rgba(128,128,128,0.4)', 'font-style': 'italic' });
    rank.textContent = `#${i + 1}`;
    svg.appendChild(rank);

    // Label (truncated to 20 chars)
    const label = (d.name || '—').length > 20 ? (d.name || '—').slice(0, 19) + '…' : (d.name || '—');
    const lbl = svgEl('text', { x: LPAD - 8, y: cy + 4, 'text-anchor': 'end', 'font-family': T.body, 'font-size': '11', fill: lblFill });
    lbl.textContent = label;
    svg.appendChild(lbl);

    // Background track
    svg.appendChild(svgEl('rect', { x: LPAD, y: cy - bh / 2, width: barW, height: bh, rx: '2', fill: T.grid, opacity: '0.28' }));

    // Bar with drop shadow + shimmer
    const barG = svgEl('g', { filter: 'url(#ocm-drop)' });
    const barLen2 = Math.max(barLen, 2);
    barG.appendChild(svgEl('rect', { x: LPAD, y: cy - bh / 2, width: barLen2, height: bh, rx: '2', fill: barClr, opacity: isTop ? '0.9' : '0.7' }));
    barG.appendChild(svgEl('rect', { x: LPAD, y: cy - bh / 2, width: barLen2, height: Math.min(bh / 2, 9), rx: '2', fill: 'rgba(255,255,255,0.22)' }));
    svg.appendChild(barG);

    // Value label
    const val = svgEl('text', { x: LPAD + barLen2 + 8, y: cy + 4, 'font-family': T.heading, 'font-size': '11', 'font-weight': '500', fill: isTop ? T.accent : 'rgba(128,128,128,0.65)' });
    val.textContent = fmtValTooltip(d.v, cfg.unit);
    svg.appendChild(val);
  });

  _addLogoWatermark(svg, defs);

  // Footer
  svg.appendChild(svgEl('line', { x1: 0, y1: H - 16, x2: W, y2: H - 16, stroke: T.ink, 'stroke-width': '0.5', opacity: '0.3' }));
  const srcLink = svgEl('a', { href: SOURCE_URLS[cfg.source] || '#', target: '_blank', style: 'cursor:pointer; text-decoration:none' });
  const srcTxt  = svgEl('text', { x: PAD.left, y: H - 4, 'font-family': T.body, 'font-size': '11', fill: 'rgba(128,128,128,0.55)', 'font-style': 'italic', style: 'transition:fill 0.15s' });
  srcTxt.textContent = `Source: ${cfg.source}`;
  srcLink.addEventListener('mouseenter', () => srcTxt.setAttribute('fill', T.accent));
  srcLink.addEventListener('mouseleave', () => srcTxt.setAttribute('fill', 'rgba(128,128,128,0.55)'));
  srcLink.appendChild(srcTxt);
  svg.appendChild(srcLink);
  const urlTxt = svgEl('text', { x: W - PAD.right, y: H - 4, 'text-anchor': 'end', 'font-family': T.heading, 'font-size': '10', fill: 'rgba(128,128,128,0.45)', 'letter-spacing': '0.1em' });
  urlTxt.textContent = 'OFFCHAIN.MEDIA/DATA';
  svg.appendChild(urlTxt);

  container.appendChild(svg);
}

/**
 * drawFullChart(container, data, cfg, period)
 * @param {HTMLElement} container
 * @param {Array<{ts,v}>} data     — full dataset
 * @param {Object}        cfg      — chart config from CATALOG
 * @param {string}        period   — "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL"
 */
export function drawFullChart(container, data, cfg, period) {
  container.innerHTML = '';

  const sliced = slicePeriod(data, period);
  if (!sliced.length) return;

  if (cfg.type === 'ranking') {
    _drawFullRanking(container, sliced, cfg);
    return;
  }

  const { points, min, max, range } = dataToPoints(sliced, PAD, CW, CH);

  const svg = svgEl('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, style: 'display:block' });
  const defs = svgEl('defs');

  // ── SVG filters ────────────────────────────────────────────────
  // Rough edges (hand-drawn wobble)
  const roughF = svgEl('filter', { id: 'ocm-rough', x: '-5%', y: '-5%', width: '110%', height: '110%' });
  const turb   = svgEl('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.012', numOctaves: '2', seed: '4', result: 'n' });
  const disp   = svgEl('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '2', xChannelSelector: 'R', yChannelSelector: 'G' });
  roughF.appendChild(turb);
  roughF.appendChild(disp);
  defs.appendChild(roughF);

  // Drop shadow (relief effect) — tinted via feFlood so it stays a soft
  // dark shadow in light mode and a soft light glow in dark mode.
  const dropF  = svgEl('filter', { id: 'ocm-drop', x: '-20%', y: '-20%', width: '140%', height: '140%' });
  const fBlur  = svgEl('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '3', result: 'blur' });
  const fOff   = svgEl('feOffset', { in: 'blur', dx: '2', dy: '4', result: 'off' });
  const fFlood = svgEl('feFlood', { style: `flood-color: ${T.shadow}`, result: 'floodColor' });
  const fComp  = svgEl('feComposite', { in: 'floodColor', in2: 'off', operator: 'in', result: 'sh' });
  const fMerge = svgEl('feMerge');
  fMerge.appendChild(svgEl('feMergeNode', { in: 'sh' }));
  fMerge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  dropF.appendChild(fBlur);
  dropF.appendChild(fOff);
  dropF.appendChild(fFlood);
  dropF.appendChild(fComp);
  dropF.appendChild(fMerge);
  defs.appendChild(dropF);

  // Volume gradient (area fill) — same adaptive tone as the curve/bars
  const volGrad = svgEl('linearGradient', { id: 'ocm-vol', x1: '0', y1: '0', x2: '0', y2: '1' });
  volGrad.appendChild(svgEl('stop', { offset: '0%',   style: `stop-color: ${T.lineFill}`, 'stop-opacity': '0.22' }));
  volGrad.appendChild(svgEl('stop', { offset: '100%', style: `stop-color: ${T.lineFill}`, 'stop-opacity': '0.02' }));
  defs.appendChild(volGrad);

  // Ridge highlight (just under line)
  const ridgeGrad = svgEl('linearGradient', { id: 'ocm-ridge', x1: '0', y1: '0', x2: '0', y2: '1' });
  ridgeGrad.appendChild(svgEl('stop', { offset: '0%',  'stop-color': '#fff', 'stop-opacity': '0.30' }));
  ridgeGrad.appendChild(svgEl('stop', { offset: '15%', 'stop-color': '#fff', 'stop-opacity': '0' }));
  defs.appendChild(ridgeGrad);

  // Clip path for chart area
  const clip = svgEl('clipPath', { id: 'ocm-clip' });
  clip.appendChild(svgEl('rect', { x: PAD.left, y: PAD.top, width: CW, height: CH }));
  defs.appendChild(clip);

  svg.appendChild(defs);
  svg.appendChild(svgEl('rect', { width: W, height: H, fill: 'transparent' }));

  // ── Grid ───────────────────────────────────────────────────────
  const _step = range / GRID_N;
  const _fmtGrid = v => {
    const a = Math.abs(v);
    if (a >= 1e9)  return `${(v / 1e9).toFixed(range / 1e9 < 5 ? 1 : 0)}B`;
    if (a >= 1e6)  return `${(v / 1e6).toFixed(range / 1e6 < 5 ? 1 : 0)}M`;
    if (a >= 1e3)  return `${(v / 1e3).toFixed(range / 1e3 < 5 ? 1 : 0)}k`;
    if (_step >= 10)   return v.toFixed(0);
    if (_step >= 1)    return v.toFixed(1);
    if (_step >= 0.1)  return v.toFixed(2);
    if (_step >= 0.01) return v.toFixed(3);
    return v.toFixed(4);
  };

  for (let i = 0; i <= GRID_N; i++) {
    const y   = PAD.top + (i / GRID_N) * CH;
    const val = max - (i / GRID_N) * range;

    svg.appendChild(svgEl('line', {
      x1: PAD.left, y1: y, x2: PAD.left + CW, y2: y,
      stroke: T.grid, 'stroke-width': '0.7', 'stroke-linecap': 'round',
    }));

    const lbl = svgEl('text', {
      x: PAD.left - 8, y: y + 4,
      'text-anchor': 'end',
      'font-family': T.body,
      'font-size': '12',
      fill: 'rgba(128,128,128,0.65)',
      'font-style': 'italic',
    });
    lbl.textContent = _fmtGrid(val);
    svg.appendChild(lbl);
  }

  // Baseline
  svg.appendChild(svgEl('line', {
    x1: PAD.left, y1: PAD.top + CH, x2: PAD.left + CW, y2: PAD.top + CH,
    stroke: 'rgba(128,128,128,0.28)', 'stroke-width': '1', 'stroke-linecap': 'round',
  }));

  // X-axis labels — show year when data spans > ~13 months
  const _span = sliced.length > 1 ? sliced[sliced.length - 1].ts - sliced[0].ts : 0;
  const _showYear = _span > 400 * 86_400_000;
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const idx = Math.round(t * (sliced.length - 1));
    const x   = PAD.left + t * CW;
    const d   = new Date(sliced[idx]?.ts || Date.now());
    const lbl = svgEl('text', {
      x, y: PAD.top + CH + 18,
      'text-anchor': 'middle',
      'font-family': T.body, 'font-size': '12',
      fill: 'rgba(128,128,128,0.6)', 'font-style': 'italic',
    });
    lbl.textContent = _showYear ? d.getFullYear() : MONTHS[d.getMonth()];
    svg.appendChild(lbl);
  });

  // ── Chart body ─────────────────────────────────────────────────
  if (cfg.type === 'bar') {
    _drawBars(svg, defs, sliced, min, range, cfg);
  } else {
    _drawLineCurve(svg, points, data, cfg, sliced);
  }

  // ── Branding ───────────────────────────────────────────────────
  _addLogoWatermark(svg, defs);

  // Footer
  svg.appendChild(svgEl('line', {
    x1: 0, y1: H - 16, x2: W, y2: H - 16,
    stroke: T.ink, 'stroke-width': '0.5', opacity: '0.3',
  }));

  const srcLink = svgEl('a', {
    href: SOURCE_URLS[cfg.source] || '#',
    target: '_blank',
    style: 'cursor:pointer; text-decoration:none',
  });
  const srcTxt = svgEl('text', {
    x: PAD.left, y: H - 4,
    'font-family': T.body, 'font-size': '11',
    fill: 'rgba(128,128,128,0.55)', 'font-style': 'italic',
    style: 'transition:fill 0.15s',
  });
  srcTxt.textContent = `Source: ${cfg.source}`;
  srcLink.addEventListener('mouseenter', () => srcTxt.setAttribute('fill', T.accent));
  srcLink.addEventListener('mouseleave', () => srcTxt.setAttribute('fill', 'rgba(128,128,128,0.55)'));
  srcLink.appendChild(srcTxt);
  svg.appendChild(srcLink);

  const urlTxt = svgEl('text', {
    x: W - PAD.right, y: H - 4,
    'text-anchor': 'end',
    'font-family': T.heading, 'font-size': '10',
    fill: 'rgba(128,128,128,0.45)', 'letter-spacing': '0.1em',
  });
  urlTxt.textContent = 'OFFCHAIN.MEDIA/DATA';
  svg.appendChild(urlTxt);

  container.appendChild(svg);
}

// Aggregate dense data into ~60 bars so bar charts stay readable at 1Y/ALL.
function _binData(data) {
  if (data.length <= 120) return data;
  const spanDays = (data[data.length - 1].ts - data[0].ts) / 86_400_000;
  const binDays  = Math.max(1, Math.ceil(spanDays / 60));
  const ms       = binDays * 86_400_000;
  const bins     = new Map();
  for (const { ts, v } of data) {
    const k = Math.floor(ts / ms);
    if (!bins.has(k)) bins.set(k, { ts, sum: 0, n: 0 });
    const b = bins.get(k);
    b.sum += v; b.n++;
  }
  return [...bins.values()]
    .sort((a, b) => a.ts - b.ts)
    .map(b => ({ ts: b.ts, v: b.sum / b.n }));
}

// ── Private: bar chart ─────────────────────────────────────────────
function _drawBars(svg, defs, sliced, min, range, cfg) {
  const data = _binData(sliced);
  const gap  = data.length > 80 ? 1 : 3;
  const bw   = Math.max(1, (CW - gap * (data.length - 1)) / Math.max(data.length, 1));
  const bars = [];
  const g    = svgEl('g', { filter: 'url(#ocm-rough)' });

  data.forEach((d, i) => {
    const rawH   = ((d.v - min) / range) * CH;
    const h      = Math.max(rawH, 2);           // min 2px so bars are always visible
    const x      = PAD.left + i * (bw + gap);
    const y      = PAD.top + CH - h;
    const isLast = i === data.length - 1;

    bars.push({ x, y, w: bw, h, d, cx: x + bw / 2 });

    const barColor = isLast ? T.accent : T.line;
    const gradId   = `ocm-bv-${i}`;
    const grad     = svgEl('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(svgEl('stop', { offset: '0%',   style: `stop-color: ${barColor}`, 'stop-opacity': isLast ? '1' : '0.85' }));
    grad.appendChild(svgEl('stop', { offset: '100%', style: `stop-color: ${barColor}`, 'stop-opacity': isLast ? '0.75' : '0.6' }));
    defs.appendChild(grad);

    const barG = svgEl('g', { filter: 'url(#ocm-drop)' });
    barG.appendChild(svgEl('rect', { x, y, width: bw, height: h, rx: '1.5', fill: `url(#${gradId})` }));
    barG.appendChild(svgEl('rect', { x, y, width: bw, height: Math.min(h, 16), rx: '1.5', fill: 'rgba(255,255,255,0.28)' }));
    g.appendChild(barG);
  });

  svg.appendChild(g);

  // ── Hover overlay ───────────────────────────────────────────────
  const highlight = svgEl('rect', {
    x: 0, y: 0, width: 0, height: 0, rx: '1.5',
    fill: 'rgba(255,255,255,0.20)', 'pointer-events': 'none', opacity: '0',
  });
  svg.appendChild(highlight);

  const tooltipG = svgEl('g', { opacity: '0', 'pointer-events': 'none' });
  const ttBox    = svgEl('rect', { x: 0, y: 0, width: 130, height: 42, rx: '2', fill: T.ink });
  const ttDate   = svgEl('text', { x: 10, y: 14, 'font-family': T.body, 'font-size': '10', fill: 'rgba(255,255,255,0.55)', 'font-style': 'italic' });
  const ttVal    = svgEl('text', { x: 10, y: 32, 'font-family': T.heading, 'font-size': '14', 'font-weight': '600', fill: '#fff' });
  tooltipG.appendChild(ttBox);
  tooltipG.appendChild(ttDate);
  tooltipG.appendChild(ttVal);
  svg.appendChild(tooltipG);

  const hitArea = svgEl('rect', {
    x: PAD.left, y: PAD.top, width: CW, height: CH,
    fill: 'transparent', style: 'cursor:crosshair',
  });

  hitArea.addEventListener('mousemove', e => {
    const rect  = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx    = (e.clientX - rect.left) * scaleX;

    let nearest = bars[0];
    let minDist = Infinity;
    bars.forEach(b => {
      const dist = Math.abs(b.cx - mx);
      if (dist < minDist) { minDist = dist; nearest = b; }
    });
    if (!nearest) return;

    highlight.setAttribute('x', nearest.x);
    highlight.setAttribute('y', nearest.y);
    highlight.setAttribute('width', nearest.w);
    highlight.setAttribute('height', nearest.h);
    highlight.setAttribute('opacity', '1');

    const tx = Math.min(nearest.cx - 65, W - 140);
    const ty = Math.max(nearest.y - 52, PAD.top);
    ttBox.setAttribute('x', tx);  ttBox.setAttribute('y', ty);
    ttDate.setAttribute('x', tx + 10); ttDate.setAttribute('y', ty + 14);
    ttVal.setAttribute('x',  tx + 10); ttVal.setAttribute('y',  ty + 32);
    ttDate.textContent = fmtDate(nearest.d.ts);
    ttVal.textContent  = fmtValTooltip(nearest.d.v, cfg.unit);
    tooltipG.setAttribute('opacity', '1');
  });

  hitArea.addEventListener('mouseleave', () => {
    highlight.setAttribute('opacity', '0');
    tooltipG.setAttribute('opacity', '0');
  });

  svg.appendChild(hitArea);
}

// ── Private: line/area chart with hover tooltip ────────────────────
function _drawLineCurve(svg, points, data, cfg, sliced) {
  const linePath  = smoothPath(points, 1.0, 3);
  const areaPath  = `${linePath} L${points[points.length-1].x},${PAD.top+CH} L${points[0].x},${PAD.top+CH} Z`;

  // Area fill
  const areaG = svgEl('g', { 'clip-path': 'url(#ocm-clip)' });
  areaG.appendChild(svgEl('path', { d: areaPath, fill: 'url(#ocm-vol)' }));
  areaG.appendChild(svgEl('path', { d: areaPath, fill: 'url(#ocm-ridge)' }));
  svg.appendChild(areaG);

  // Curves with filter
  const curveG = svgEl('g', { filter: 'url(#ocm-rough)', 'clip-path': 'url(#ocm-clip)' });
  curveG.appendChild(svgEl('path', { d: linePath, fill: 'none', style: `stroke: ${T.line}`, 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#ocm-drop)' }));

  if (points.length > 12) {
    curveG.appendChild(svgEl('path', {
      d: smoothPath(points.slice(-12), 1.0, 4),
      fill: 'none', stroke: T.accent, 'stroke-width': '2.5',
      'stroke-linecap': 'round', filter: 'url(#ocm-drop)',
    }));
  }
  svg.appendChild(curveG);

  // End point marker
  const last = points[points.length - 1];
  if (last) {
    svg.appendChild(svgEl('circle', { cx: last.x, cy: last.y, r: '4', fill: T.accent }));
    svg.appendChild(svgEl('path', {
      d: sketchCircle(last.x, last.y, 9),
      fill: 'none', stroke: T.accent, 'stroke-width': '1.2',
      opacity: '0.6', 'stroke-linecap': 'round',
    }));
  }

  // Hover elements
  const hoverLine = svgEl('line', {
    x1: 0, y1: PAD.top, x2: 0, y2: PAD.top + CH,
    stroke: T.accent, 'stroke-width': '0.7', 'stroke-dasharray': '3,3',
    opacity: '0', 'pointer-events': 'none',
  });
  svg.appendChild(hoverLine);

  const tooltipG = svgEl('g', { opacity: '0', 'pointer-events': 'none' });
  const ttBox    = svgEl('rect', { x: 0, y: 0, width: 130, height: 42, rx: '2', fill: T.ink });
  const ttDate   = svgEl('text', { x: 10, y: 14, 'font-family': T.body, 'font-size': '10', fill: 'rgba(255,255,255,0.55)', 'font-style': 'italic' });
  const ttVal    = svgEl('text', { x: 10, y: 32, 'font-family': T.heading, 'font-size': '14', 'font-weight': '600', fill: '#fff' });
  tooltipG.appendChild(ttBox);
  tooltipG.appendChild(ttDate);
  tooltipG.appendChild(ttVal);
  svg.appendChild(tooltipG);

  // Invisible hit area for mouse events
  const hitArea = svgEl('rect', {
    x: PAD.left, y: PAD.top, width: CW, height: CH,
    fill: 'transparent', style: 'cursor:crosshair',
  });

  hitArea.addEventListener('mousemove', e => {
    const rect   = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx     = (e.clientX - rect.left) * scaleX;

    let nearest = points[0];
    let minDist = Infinity;
    points.forEach(p => {
      const d = Math.abs(p.x - mx);
      if (d < minDist) { minDist = d; nearest = p; }
    });

    hoverLine.setAttribute('x1', nearest.x);
    hoverLine.setAttribute('x2', nearest.x);
    hoverLine.setAttribute('opacity', '0.5');

    const tx = Math.min(nearest.x + 8, W - 140);
    const ty = Math.max(nearest.y - 52, PAD.top);
    ttBox.setAttribute('x', tx);  ttBox.setAttribute('y', ty);
    ttDate.setAttribute('x', tx + 10); ttDate.setAttribute('y', ty + 14);
    ttVal.setAttribute('x',  tx + 10); ttVal.setAttribute('y',  ty + 32);
    ttDate.textContent = fmtDate(nearest.d.ts);
    ttVal.textContent  = fmtValTooltip(nearest.d.v, cfg.unit);
    tooltipG.setAttribute('opacity', '1');
  });

  hitArea.addEventListener('mouseleave', () => {
    hoverLine.setAttribute('opacity', '0');
    tooltipG.setAttribute('opacity', '0');
  });

  svg.appendChild(hitArea);
}

// ── Private: Off-Chain Media logo watermark ────────────────────────
function _addLogoWatermark(svg, defs) {
  const p  = `ocmwm${_wmId++}`;
  const cx = PAD.left + CW / 2;    // horizontal center of chart area
  const cy = PAD.top  + CH / 2;    // vertical center of chart area

  // Logo symbol spans x=[384,1340], y=[201,629] in original 1440×810 space.
  // Scale to 160px wide, center on chart.
  const s  = 160 / 956;
  const tx = cx - s * 862;
  const ty = cy - s * 415;

  const addClip = (id, d) => {
    const cp = svgEl('clipPath', { id: p + id });
    cp.appendChild(svgEl('path', { d }));
    defs.appendChild(cp);
  };

  // Bounding-box clips that create the C-shapes from each full ring path
  addClip('r', 'M726 201 L1077 201 L1077 629 L726 629Z');
  addClip('l', 'M384 201 L999 201 L999 629 L384 629Z');
  // Square clip for the filled block detail
  addClip('b', 'M934.7 537.1 L1015.5 537.1 L1015.5 628.2 L934.7 628.2Z');

  const wm = svgEl('g', {
    transform: `translate(${tx.toFixed(1)},${ty.toFixed(1)}) scale(${s.toFixed(4)})`,
    style: `fill: ${T.line}`,
    opacity: '0.06',
  });

  // Right chain ring (clipped to left half → creates right C-shape)
  const gr = svgEl('g', { 'clip-path': `url(#${p}r)` });
  gr.appendChild(svgEl('path', { d: 'M1340.3 414.7C1340.4 296.8 1244.8 201.2 1126.9 201.3L958.4 201.4C965.7 207.3 972.8 213.7 979.6 220.5C1000.9 241.8 1018.2 265.9 1031.3 292.1L1126.8 292C1159.6 292 1190.4 304.8 1213.6 328C1236.8 351.1 1249.6 382 1249.5 414.8C1249.5 447.6 1236.7 478.4 1213.5 501.6C1190.3 524.8 1159.4 537.6 1126.7 537.6L939.8 537.7C907 537.8 876.2 525 852.9 501.8C829.8 478.6 817 447.8 817.1 415C817 399.1 820.1 383.6 825.9 369.2C814.7 359.1 800.3 353.6 785.1 353.6L735.3 353.7C729.5 373.1 726.3 393.8 726.2 415.1C726.2 533 821.8 628.6 939.7 628.5L1126.6 628.4C1244.5 628.3 1340.2 532.7 1340.3 414.7Z' }));
  wm.appendChild(gr);

  // Left chain ring (clipped to right half → creates left C-shape)
  const gl = svgEl('g', { 'clip-path': `url(#${p}l)` });
  gl.appendChild(svgEl('path', { d: 'M746.3 610.5C725 589.2 707.5 564.8 694.2 537.9L598.1 537.9C565.3 538 534.4 525.2 511.3 502.1C488.1 478.9 475.3 448.1 475.4 415.2C475.4 382.4 488.2 351.6 511.4 328.4C534.6 305.2 565.4 292.4 598.3 292.4L785.1 292.2C817.9 292.3 848.7 305 871.9 328.2C895.1 351.4 907.8 382.2 907.8 415C907.8 430.9 904.8 446.4 899 460.8C910.2 471 924.6 476.5 939.9 476.4L989.6 476.4C995.4 456.9 998.6 436.3 998.6 414.9C998.7 297 903.1 201.4 785.2 201.5L598.3 201.6C480.3 201.7 384.6 297.3 384.6 415.3C384.5 533.3 480 628.8 598 628.8L766.2 628.6C759.4 623 752.7 616.9 746.3 610.5Z' }));
  wm.appendChild(gl);

  // Interlocking connector between the two rings (path pre-computed from the
  // original SVG's matrix transform on the S-curve stroke element)
  wm.appendChild(svgEl('path', {
    d: 'M771.5 430C796.8 542.8 866.9 593.7 982.1 582.7',
    style: `fill:none;stroke:${T.line};stroke-width:50;stroke-linecap:butt;stroke-miterlimit:4`,
  }));

  // Filled block detail (bottom-right of the logo symbol)
  const gb = svgEl('g', { 'clip-path': `url(#${p}b)` });
  gb.appendChild(svgEl('rect', { x: '934.7', y: '537.1', width: '80.8', height: '91.2' }));
  wm.appendChild(gb);

  svg.appendChild(wm);
}
