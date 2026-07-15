/**
 * Embed mode — renders a single chart into a container element.
 * Used by Webflow CMS template pages (one page per chart).
 *
 * Webflow template page embed code:
 *   <script>window.__OCM__ = "{{wf {path:'metric-id',type:'PlainText'}}}";</script>
 *   <div class="ocm-embed"></div>
 */

import { CATALOG }                  from '../catalog.js';
import { loadData, slicePeriod, fmtVal, fmtValBig } from '../data.js';
import { drawFullChart }             from '../charts/fullchart.js';
import { T }                         from '../tokens.js';

const PERIODS     = ['1W', '1M', '3M', '1Y', 'ALL'];
const PERIOD_DAYS = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };

function _hasCoverage(data, period) {
  const s = slicePeriod(data, period);
  if (!s.length) return false;
  if (period === 'ALL') return true;
  const days = PERIOD_DAYS[period];
  const span = s.length > 1 ? (s[s.length - 1].ts - s[0].ts) / 86_400_000 : 0;
  return span >= days * 0.7;
}

export async function renderEmbedChart(container, chartId) {
  const cfg = CATALOG.find(c => c.id === chartId);
  if (!cfg) {
    container.innerHTML = `<p style="font-family:${T.body};color:${T.muted};padding:20px">Chart not found: ${chartId}</p>`;
    return;
  }

  // ── Styles ─────────────────────────────────────────────────────────
  if (!document.getElementById('ocm-embed-styles')) {
    const st = document.createElement('style');
    st.id = 'ocm-embed-styles';
    st.textContent = `
      .ocm-embed { display:flex; flex-direction:column; gap:0; }
      .ocm-embed-topbar { display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:0 0 12px; }
      .ocm-embed-headline { font-family:${T.heading}; font-size:clamp(22px,3vw,32px); font-weight:700; color:${T.textAdaptive}; letter-spacing:-0.5px; line-height:1; }
      .ocm-embed-reading { font-family:${T.heading}; font-size:clamp(20px,2.4vw,28px); font-weight:700; color:${T.accent}; }
      .ocm-embed-periods { display:flex; gap:6px; padding:0 0 10px; flex-wrap:wrap; }
      .ocm-embed-pbtn { font-family:${T.heading}; font-size:11px; font-weight:500; letter-spacing:0.5px; text-transform:uppercase; padding:4px 10px; border:1px solid rgba(128,128,128,0.25); border-radius:3px; cursor:pointer; color:${T.textAdaptiveMuted}; background:transparent; transition:all 0.15s; }
      .ocm-embed-pbtn:hover { border-color:${T.accent}; color:${T.accent}; }
      .ocm-embed-pbtn.active { border-color:${T.accent}; color:${T.accent}; background:rgba(247,147,26,0.08); }
      .ocm-embed-chart { width:100%; flex:1; min-height:340px; }
      .ocm-embed-source { font-family:${T.body}; font-size:11px; color:${T.muted}; font-style:italic; padding:6px 0 0; text-align:right; }
    `;
    document.head.appendChild(st);
  }

  // ── Structure ──────────────────────────────────────────────────────
  container.classList.add('ocm-embed');
  container.innerHTML = `
    <div class="ocm-embed-topbar">
      <span class="ocm-embed-headline">${cfg.title}</span>
      <span class="ocm-embed-reading">Loading…</span>
    </div>
    <div class="ocm-embed-periods"></div>
    <div class="ocm-embed-chart"></div>
    <div class="ocm-embed-source">Source: ${cfg.source}</div>
  `;

  const topbar   = container.querySelector('.ocm-embed-topbar');
  const reading  = container.querySelector('.ocm-embed-reading');
  const periodsEl= container.querySelector('.ocm-embed-periods');
  const chartEl  = container.querySelector('.ocm-embed-chart');

  // ── Fetch data ─────────────────────────────────────────────────────
  const { data, live } = await loadData(cfg.api);

  // Headline: ranking → top value, time-series → latest value
  if (cfg.type === 'ranking') {
    const top = [...data].sort((a, b) => b.v - a.v)[0];
    if (top) reading.textContent = fmtValBig(top.v, cfg.unit);
    periodsEl.style.display = 'none';
    drawFullChart(chartEl, data, cfg, 'ALL');
    if (!live) reading.textContent += ' (demo)';
    return;
  }

  const last = data[data.length - 1];
  if (last) reading.textContent = fmtValBig(last.v, cfg.unit) + (live ? '' : ' (demo)');

  // ── Period buttons ─────────────────────────────────────────────────
  const available = PERIODS.filter(p => _hasCoverage(data, p));
  const prefOrder = ['1Y', '3M', '1M', '1W', 'ALL'];
  let current     = prefOrder.find(p => available.includes(p)) || available[0] || '1Y';

  available.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'ocm-embed-pbtn' + (p === current ? ' active' : '');
    btn.textContent = p;
    btn.addEventListener('click', () => {
      current = p;
      periodsEl.querySelectorAll('.ocm-embed-pbtn').forEach(b =>
        b.classList.toggle('active', b === btn)
      );
      _render();
    });
    periodsEl.appendChild(btn);
  });

  function _render() {
    drawFullChart(chartEl, data, cfg, current);
  }
  _render();
}
