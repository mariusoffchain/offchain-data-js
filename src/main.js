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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function showDetail(chartId) {
  currentChartId = chartId;
  currentPeriod  = '1Y';

  if (galleryEl) galleryEl.style.display = 'none';
  if (detailEl)  detailEl.style.display  = '';

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

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
  initPeriodBtns();
  initBackBtn();
  initBlockStrip();
  await initGallery(showDetail);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
