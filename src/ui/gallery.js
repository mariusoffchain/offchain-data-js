/**
 * Gallery UI
 * Handles: sidebar filtering, lazy-loaded interactive chart cards.
 */

import { CATALOG } from '../catalog.js';
import { loadData, slicePeriod, fmtVal, fmtValBig } from '../data.js';
import { drawFullChart } from '../charts/fullchart.js';
import { initSidebar } from './sidebar.js';
import { injectGalleryStyles } from './styles.js';
import { T } from '../tokens.js';

const CARD_PERIODS   = ['1W', '1M', '3M', '1Y', 'ALL'];
const DEFAULT_PERIOD = '1Y';
// Preference order when picking the best available period
const PERIOD_PREF    = ['1Y', '3M', '1M', '1W', 'ALL'];

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

  const { periodBar, headline } = _buildTopRow(card);

  const { data, live } = await loadData(cfg.api);
  let currentPeriod = DEFAULT_PERIOD;

  // Overwrite Webflow static title text with catalog title (fixes mismatches like "BTC Dominance")
  const titleEl = card.querySelector('h1, h2, h3, h4, h5, h6');
  if (titleEl && cfg.title) titleEl.textContent = cfg.title;

  // Headline always reflects the latest point — period only trims history.
  const last = data[data.length - 1];
  if (last) headline.textContent = fmtValBig(last.v, cfg.unit) + (live ? '' : ' (demo)');

  const render = period => {
    drawFullChart(chartDiv, data, cfg, period);
    const sliced     = slicePeriod(data, period);
    const lastSliced = sliced[sliced.length - 1];

    if (!chartDiv.firstChild) {
      chartDiv.style.cssText = 'display:flex;align-items:center;justify-content:center';
      chartDiv.innerHTML = `<span style="font-family:${T.body};font-style:italic;font-size:13px;color:rgba(128,128,128,0.5)">No data for this period</span>`;
    } else {
      chartDiv.style.cssText = '';
    }

    const readingEl = card.querySelector('.ocm-card-reading');
    if (readingEl && lastSliced) {
      readingEl.textContent = fmtVal(lastSliced.v, cfg.unit) + (live ? '' : ' (demo)');
    }
  };

  // Hide period buttons for which this chart has no data
  const availablePeriods = CARD_PERIODS.filter(p => slicePeriod(data, p).length > 0);
  periodBar.querySelectorAll('.ocm-card-period-btn').forEach(btn => {
    btn.style.display = availablePeriods.includes(btn.dataset.period) ? '' : 'none';
  });

  // Pick best starting period: 1Y preferred, fall back to 3M, then first available
  currentPeriod = PERIOD_PREF.find(p => availablePeriods.includes(p)) || availablePeriods[0] || DEFAULT_PERIOD;
  periodBar.querySelectorAll('.ocm-card-period-btn').forEach(b =>
    b.classList.toggle('ocm-card-period-active', b.dataset.period === currentPeriod)
  );

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

function _buildTopRow(card) {
  const meta = card.querySelector('.ocm-card-meta');
  const row  = document.createElement('div');
  row.className = 'ocm-card-toprow';

  const periodBar = document.createElement('div');
  periodBar.className = 'ocm-card-periods';
  CARD_PERIODS.forEach(p => {
    const btn = document.createElement('span');
    btn.className   = 'ocm-card-period-btn' + (p === DEFAULT_PERIOD ? ' ocm-card-period-active' : '');
    btn.textContent = p;
    btn.dataset.period = p;
    periodBar.appendChild(btn);
  });

  const headline = document.createElement('span');
  headline.className = 'ocm-card-headline';

  row.appendChild(periodBar);
  row.appendChild(headline);

  if (meta) meta.insertAdjacentElement('afterend', row);
  else card.insertBefore(row, card.firstChild);

  return { periodBar, headline };
}
