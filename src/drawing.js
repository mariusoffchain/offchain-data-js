/**
 * Off-Chain Media — SVG Drawing Helpers
 * Pure functions, no side effects, no DOM dependencies.
 */

// ─── Seeded pseudo-random (consistent jitter across renders) ─────
export function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─── SVG element factory ─────────────────────────────────────────
export function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// ─── Smooth Catmull-Rom path with optional jitter ────────────────
/**
 * smoothPath(pts, jitter, seed)
 * @param {Array<{x,y}>} pts
 * @param {number} jitter  — max pixel wobble per point (0 = clean)
 * @param {number} seed    — seed for consistent randomness
 * @returns SVG path string (M ... C ...)
 */
export function smoothPath(pts, jitter = 1.0, seed = 1) {
  const rand = seededRand(seed);
  const j    = pts.map(p => ({
    x: p.x + (rand() - 0.5) * jitter,
    y: p.y + (rand() - 0.5) * jitter,
  }));
  if (j.length < 2) return '';

  let d = `M${j[0].x.toFixed(2)},${j[0].y.toFixed(2)}`;
  for (let i = 0; i < j.length - 1; i++) {
    const p0  = j[Math.max(0, i - 1)];
    const p1  = j[i];
    const p2  = j[i + 1];
    const p3  = j[Math.min(j.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

// ─── Hand-drawn wobbly circle ────────────────────────────────────
/**
 * sketchCircle(cx, cy, r)
 * Returns an SVG path string for a slightly imperfect circle —
 * used as the end-point marker on full charts.
 */
export function sketchCircle(cx, cy, r) {
  const rand  = seededRand(Math.round(cx + cy));
  const start = rand() * Math.PI;
  const pts   = [];
  for (let a = 0; a <= Math.PI * 2 * 1.15; a += 0.3) {
    const rr = r + (rand() - 0.5) * 1.5;
    pts.push(
      `${(cx + Math.cos(a + start) * rr).toFixed(1)},` +
      `${(cy + Math.sin(a + start) * rr).toFixed(1)}`
    );
  }
  return 'M' + pts.join(' L');
}

// ─── Data → SVG points ───────────────────────────────────────────
/**
 * dataToPoints(data, PAD, CW, CH)
 * Converts normalized data array to SVG pixel coordinates.
 * @returns { points: Array<{x,y,d}>, min, max, range }
 */
export function dataToPoints(data, PAD, CW, CH) {
  const vals  = data.map(d => d.v);
  const min   = Math.min(...vals);
  const max   = Math.max(...vals);
  const range = max - min || 1;
  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * CW,
    y: PAD.top  + CH - ((d.v - min) / range) * CH,
    d,
  }));
  return { points, min, max, range };
}
