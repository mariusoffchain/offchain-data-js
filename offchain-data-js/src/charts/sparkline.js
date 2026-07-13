/**
 * Sparkline — mini chart rendered inside gallery cards.
 * SVG, ~48px tall, accent orange on recent trend, ink on history.
 */

import { svgEl, smoothPath } from '../drawing.js';
import { T } from '../tokens.js';

/**
 * drawSparkline(container, data, type)
 * @param {HTMLElement} container
 * @param {Array<{ts,v}>} data
 * @param {'line'|'area'|'bar'} type
 */
export function drawSparkline(container, data, type) {
  container.innerHTML = '';
  const W   = container.offsetWidth || 220;
  const H   = 48;
  const vals = data.map(d => d.v);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const rng  = max - min || 1;

  const toX = i => (i / (data.length - 1)) * W;
  const toY = v => H - ((v - min) / rng) * (H - 6) - 3;

  const svg = svgEl('svg', { width: '100%', height: H, viewBox: `0 0 ${W} ${H}` });

  // Gradient for area fill
  const gradId = `sg-${container.dataset.chartId || Math.random()}`;
  const defs   = svgEl('defs');
  const grad   = svgEl('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
  grad.appendChild(svgEl('stop', { offset: '0%',   'stop-color': T.accent, 'stop-opacity': '0.22' }));
  grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': T.accent, 'stop-opacity': '0.01' }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  if (type === 'bar') {
    const bw = Math.max(2, W / data.length - 1.5);
    data.forEach((d, i) => {
      const h    = ((d.v - min) / rng) * (H - 4);
      const x    = (i / data.length) * W;
      const isLast = i === data.length - 1;
      svg.appendChild(svgEl('rect', {
        x, y: H - h - 2, width: bw, height: h,
        fill:    isLast ? T.accent : T.ink,
        rx:      '1',
        opacity: '0.75',
      }));
    });
  } else {
    const pts      = data.map((d, i) => ({ x: toX(i), y: toY(d.v) }));
    const linePath = smoothPath(pts, 0.8, 42);
    const areaPath = `${linePath} L${toX(data.length - 1)},${H} L0,${H} Z`;

    // Area fill
    svg.appendChild(svgEl('path', { d: areaPath, fill: `url(#${gradId})` }));

    // Historical line in ink
    const histPts = pts.slice(0, -8);
    if (histPts.length > 1) {
      svg.appendChild(svgEl('path', {
        d: smoothPath(histPts, 0.8, 5),
        fill: 'none', stroke: T.ink, 'stroke-width': '1.5', 'stroke-linecap': 'round',
      }));
    }

    // Recent trend in accent orange
    const recentPts = pts.slice(-9);
    if (recentPts.length > 1) {
      svg.appendChild(svgEl('path', {
        d: smoothPath(recentPts, 0.8, 9),
        fill: 'none', stroke: T.accent, 'stroke-width': '2', 'stroke-linecap': 'round',
      }));
    }
  }

  container.appendChild(svg);
}
