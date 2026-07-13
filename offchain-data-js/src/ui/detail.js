/**
 * Detail UI
 * Handles: full chart rendering, editorial content, period selector, related charts.
 */

import { CATALOG } from '../catalog.js';
import { EDITORIAL } from '../editorial.js';
import { loadData, slicePeriod, fmtVal } from '../data.js';
import { drawFullChart } from '../charts/fullchart.js';
import { T } from '../tokens.js';

/**
 * renderDetail(chartId, period)
 * Fills the .ocm-detail-view with content for the given chart + period.
 */
export async function renderDetail(chartId, period) {
  const cfg = CATALOG.find(c => c.id === chartId);
  const ed  = EDITORIAL[chartId] || {};
  const el  = document.querySelector('.ocm-detail-view');
  if (!cfg || !el) return;

  // Breadcrumb
  const catEl = el.querySelector('.ocm-breadcrumb-cat');
  if (catEl) catEl.textContent = _fmtCat(cfg.category);

  // Title + subtitle
  _setText(el, '.ocm-detail-title',    cfg.title);
  _setText(el, '.ocm-detail-subtitle', cfg.subtitle);

  // Editorial
  _setText(el, '.ocm-measures-text',   ed.measures   || '');
  _setText(el, '.ocm-importance-text', ed.importance || '');
  _setText(el, '.ocm-editorial-text',  ed.update     || '');

  // Signature date
  _setText(el, '.ocm-sig-date',
    `Last updated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
  );

  // Period buttons
  el.querySelectorAll('.ocm-period-btn').forEach(btn => {
    btn.classList.toggle('ocm-period-active', btn.dataset.period === period);
  });

  // Loading state
  _setText(el, '.ocm-reading-value', 'Loading…');
  const chartEl = el.querySelector('.ocm-detail-chart');
  if (chartEl) chartEl.innerHTML = `<p style="padding:20px;font-family:${T.body};color:${T.muted};font-style:italic">Loading chart…</p>`;

  // Fetch data
  const { data, live } = await loadData(cfg.api);
  const sliced = slicePeriod(data, period);
  const last   = sliced[sliced.length - 1];

  // Reading value
  const readingEl = el.querySelector('.ocm-reading-value');
  if (readingEl && last) {
    readingEl.textContent = fmtVal(last.v, cfg.unit) + (live ? '' : ' (demo data)');
  }

  // Full chart
  if (chartEl) drawFullChart(chartEl, data, cfg, period);

  // Related charts
  _renderRelated(el, cfg);
}

// ── Related charts ─────────────────────────────────────────────────
function _renderRelated(el, cfg) {
  const grid = el.querySelector('.ocm-related-grid');
  if (!grid) return;

  grid.innerHTML = '';
  CATALOG
    .filter(c => c.category === cfg.category && c.id !== cfg.id)
    .slice(0, 4)
    .forEach(c => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:14px 16px;cursor:pointer;transition:background 0.15s';
      div.innerHTML = `
        <h3 style="font-family:${T.heading};font-size:14px;font-weight:500;margin:0 0 4px">${c.title}</h3>
        <p style="font-size:12px;color:${T.muted};margin:0;font-style:italic;font-family:${T.body}">${c.subtitle}</p>
      `;
      div.addEventListener('click', () => {
        // Re-dispatch to main router via custom event
        document.dispatchEvent(new CustomEvent('ocm:openChart', { detail: c.id }));
      });
      div.addEventListener('mouseenter', () => div.style.background = 'rgba(128,128,128,0.08)');
      div.addEventListener('mouseleave', () => div.style.background = '');
      grid.appendChild(div);
    });
}

// ── Helpers ────────────────────────────────────────────────────────
function _setText(root, selector, text) {
  const el = root.querySelector(selector);
  if (el) el.textContent = text;
}

function _fmtCat(cat) {
  return cat.replace('-', ' ').toUpperCase();
}
