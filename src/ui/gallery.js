/**
 * Gallery UI
 * Handles: card initialization, sparkline rendering, category filters.
 */

import { CATALOG } from '../catalog.js';
import { loadData, slicePeriod, fmtVal } from '../data.js';
import { drawSparkline } from '../charts/sparkline.js';

/**
 * initGallery(onCardClick)
 * @param {Function} onCardClick  — called with chartId when a card is clicked
 */
export async function initGallery(onCardClick) {
  _initFilters();
  await _initCards(onCardClick);
}

// ── Category filter tabs ───────────────────────────────────────────
function _initFilters() {
  const btns = document.querySelectorAll('.ocm-filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('ocm-filter-active'));
      btn.classList.add('ocm-filter-active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.ocm-category-section').forEach(sec => {
        sec.style.display = (filter === 'all' || sec.dataset.category === filter) ? '' : 'none';
      });
    });
  });
}

// ── Card initialization ────────────────────────────────────────────
async function _initCards(onCardClick) {
  // Pre-fetch market data once to avoid 4 separate CoinGecko calls
  try {
    await loadData('price'); // warms cache._market for price, marketcap, volume
  } catch { /* fallback handled inside loadData */ }

  const cards = document.querySelectorAll('.ocm-card');

  for (const card of cards) {
    const chartId = card.dataset.chartId;
    if (!chartId) continue;

    const cfg = CATALOG.find(c => c.id === chartId);
    if (!cfg) continue;

    // Click handler
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onCardClick(chartId));

    // Hover
    card.addEventListener('mouseenter', () => card.style.background = 'rgba(128,128,128,0.08)');
    card.addEventListener('mouseleave', () => card.style.background = '');

    // Load data + render
    const chartDiv = card.querySelector('.ocm-card-chart');
    if (chartDiv) {
      chartDiv.dataset.chartId = chartId;
      const { data } = await loadData(cfg.api);
      const sliced   = slicePeriod(data, '3M');
      drawSparkline(chartDiv, sliced, cfg.type);

      // Update reading
      const readingEl = card.querySelector('.ocm-card-reading');
      const last      = sliced[sliced.length - 1];
      if (readingEl && last) {
        readingEl.textContent = fmtVal(last.v, cfg.unit);
      }
    }
  }
}
