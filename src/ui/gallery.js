/**
 * Gallery UI
 * Handles: sidebar filtering, lazy-loaded interactive chart cards.
 */

import { CATALOG } from '../catalog.js';
import { loadData, slicePeriod, fmtVal } from '../data.js';
import { drawFullChart } from '../charts/fullchart.js';
import { initSidebar } from './sidebar.js';
import { injectGalleryStyles } from './styles.js';

const CARD_PERIODS  = ['3M', '1Y', 'ALL'];
const DEFAULT_PERIOD = '3M';

/**
 * initGallery(onCardClick)
 * @param {Function} onCardClick  — called with chartId when "See more" is clicked
 */
export async function initGallery(onCardClick) {
  injectGalleryStyles();
  _initFilters();
  initSidebar(_applyFilter);
  await _initCards(onCardClick);
}

// ── Category filtering (shared by sidebar + legacy top bar) ────────
function _applyFilter(filter) {
  document.querySelectorAll('.ocm-category-section').forEach(sec => {
    sec.style.display = (filter === 'all' || sec.dataset.category === filter) ? '' : 'none';
  });
}

function _initFilters() {
  const btns = document.querySelectorAll('.ocm-filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('ocm-filter-active'));
      btn.classList.add('ocm-filter-active');
      _applyFilter(btn.dataset.filter);
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
  const observer = new IntersectionObserver(_onCardVisible, { rootMargin: '200px 0px' });

  cards.forEach(card => {
    const chartId = card.dataset.chartId;
    if (!chartId || !CATALOG.find(c => c.id === chartId)) return;

    const seeMore = card.querySelector('.ocm-see-more');
    if (seeMore) {
      seeMore.addEventListener('click', e => {
        e.stopPropagation();
        onCardClick(chartId);
      });
    }

    observer.observe(card);
  });
}

function _onCardVisible(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    _mountCard(entry.target);
  });
}

async function _mountCard(card) {
  const chartId = card.dataset.chartId;
  const cfg     = CATALOG.find(c => c.id === chartId);
  if (!cfg) return;

  const chartDiv = card.querySelector('.ocm-card-chart');
  if (!chartDiv) return;
  chartDiv.classList.add('ocm-card-chart-full');

  const periodBar = _buildPeriodBar(card);

  const { data, live } = await loadData(cfg.api);
  let currentPeriod = DEFAULT_PERIOD;

  const render = period => {
    drawFullChart(chartDiv, data, cfg, period);
    const sliced = slicePeriod(data, period);
    const last   = sliced[sliced.length - 1];
    const readingEl = card.querySelector('.ocm-card-reading');
    if (readingEl && last) {
      readingEl.textContent = fmtVal(last.v, cfg.unit) + (live ? '' : ' (demo)');
    }
  };

  periodBar.querySelectorAll('.ocm-card-period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPeriod = btn.dataset.period;
      periodBar.querySelectorAll('.ocm-card-period-btn').forEach(b =>
        b.classList.toggle('ocm-card-period-active', b === btn)
      );
      render(currentPeriod);
    });
  });

  render(currentPeriod);
}

function _buildPeriodBar(card) {
  const meta = card.querySelector('.ocm-card-meta');
  const bar  = document.createElement('div');
  bar.className = 'ocm-card-periods';

  CARD_PERIODS.forEach(p => {
    const btn = document.createElement('span');
    btn.className   = 'ocm-card-period-btn' + (p === DEFAULT_PERIOD ? ' ocm-card-period-active' : '');
    btn.textContent = p;
    btn.dataset.period = p;
    bar.appendChild(btn);
  });

  if (meta) meta.insertAdjacentElement('afterend', bar);
  else card.insertBefore(bar, card.firstChild);

  return bar;
}
