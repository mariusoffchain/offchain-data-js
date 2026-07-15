/**
 * Off-Chain Media — Data Library
 * Entry point. Boots gallery, wires navigation between gallery ↔ detail.
 *
 * State machine:
 *   gallery  ← default, shows all chart cards
 *   detail   ← shown when a card is clicked, hidden on back button
 */

import { initGallery }    from './ui/gallery.js';
import { renderDetail }   from './ui/detail.js';
import { initBlockStrip } from './ui/blockstrip.js';

// ── State ─────────────────────────────────────────────────────────
let currentChartId = null;
let currentPeriod  = '1Y';

const galleryEl = document.querySelector('.ocm-gallery-view');
const detailEl  = document.querySelector('.ocm-detail-view');

// ── Navigation ────────────────────────────────────────────────────
function showGallery() {
  if (galleryEl) galleryEl.style.display = '';
  if (detailEl)  detailEl.style.display  = 'none';
  currentChartId = null;
  // Clear ?chart= param without reloading
  const url = new URL(window.location.href);
  url.searchParams.delete('chart');
  window.history.pushState({}, '', url);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function showDetail(chartId, pushState = true) {
  currentChartId = chartId;
  currentPeriod  = '1Y';

  if (galleryEl) galleryEl.style.display = 'none';
  if (detailEl)  detailEl.style.display  = '';

  // Update URL so the chart is directly shareable as ?chart=<id>
  if (pushState) {
    const url = new URL(window.location.href);
    url.searchParams.set('chart', chartId);
    window.history.pushState({ chartId }, '', url);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  await renderDetail(chartId, currentPeriod);
}

// ── Period selector ───────────────────────────────────────────────
function initPeriodBtns() {
  document.querySelectorAll('.ocm-period-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      currentPeriod = btn.dataset.period;
      if (currentChartId) await renderDetail(currentChartId, currentPeriod);
    });
  });
}

// ── Back button ───────────────────────────────────────────────────
function initBackBtn() {
  const btn = document.querySelector('.ocm-back-btn');
  if (btn) btn.addEventListener('click', showGallery);
}

// ── Custom event from related charts ─────────────────────────────
document.addEventListener('ocm:openChart', e => showDetail(e.detail));

// ── Browser back/forward ──────────────────────────────────────────
window.addEventListener('popstate', () => {
  const id = new URLSearchParams(window.location.search).get('chart');
  if (id) showDetail(id, false);
  else    showGallery();
});

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
  initPeriodBtns();
  initBackBtn();
  initBlockStrip();
  await initGallery(showDetail);

  // If the page is loaded with ?chart=<id>, open that chart directly
  // (works for shared links and social media previews)
  const initialChart = new URLSearchParams(window.location.search).get('chart');
  if (initialChart) await showDetail(initialChart, false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
