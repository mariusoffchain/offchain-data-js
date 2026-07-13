/**
 * Runtime style injection for the sidebar + full-chart gallery layout.
 * Injected once at boot — keeps Webflow's authored markup untouched,
 * only the visual layout is overridden.
 */

import { T } from '../tokens.js';

let injected = false;

export function injectGalleryStyles() {
  if (injected) return;
  injected = true;

  const style = document.createElement('style');
  style.textContent = `
    .ocm-data-filters { display: none !important; }

    .ocm-gallery-view {
      display: flex;
      align-items: flex-start;
      gap: 28px;
    }

    .ocm-sidebar {
      flex: 0 0 152px;
      position: sticky;
      top: 24px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ocm-sidebar-item {
      font-family: ${T.heading};
      font-size: 12px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(250,247,241,0.55);
      padding: 8px 10px;
      border-radius: 3px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .ocm-sidebar-item:hover { color: ${T.paper}; background: rgba(255,255,255,0.05); }
    .ocm-sidebar-item.ocm-sidebar-active {
      color: ${T.accent};
      background: rgba(247,147,26,0.10);
    }

    .ocm-gallery-inner { flex: 1; min-width: 0; }

    .ocm-cards-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 20px !important;
    }

    .ocm-card-chart-full {
      height: auto !important;
      aspect-ratio: 680 / 380;
      overflow: visible;
    }

    .ocm-card-toprow {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin: 2px 0 8px;
    }

    .ocm-card-periods {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .ocm-card-headline {
      font-family: ${T.heading};
      font-size: 22px;
      font-weight: 600;
      color: ${T.accent};
      letter-spacing: 0.01em;
      text-align: right;
      white-space: nowrap;
    }
    .ocm-card-period-btn {
      font-family: ${T.heading};
      font-size: 10px;
      letter-spacing: 0.04em;
      padding: 2px 8px;
      border-radius: 3px;
      color: rgba(128,128,128,0.7);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .ocm-card-period-btn:hover { color: ${T.ink}; }
    .ocm-card-period-btn.ocm-card-period-active {
      color: ${T.accent};
      background: rgba(247,147,26,0.12);
    }

    .ocm-see-more { cursor: pointer; }

    @media (max-width: 700px) {
      .ocm-gallery-view { flex-direction: column; gap: 16px; }
      .ocm-sidebar {
        flex-direction: row;
        overflow-x: auto;
        position: static;
        width: 100%;
        gap: 6px;
      }
      .ocm-sidebar-item { flex: 0 0 auto; white-space: nowrap; }
      .ocm-cards-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}
