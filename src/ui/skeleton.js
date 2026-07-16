/**
 * Loading skeletons — shimmer placeholders shown while chart data loads.
 * Theme-neutral (grey alpha) so they work in both light and dark mode.
 */

let injected = false;

export function injectSkeletonStyles() {
  if (injected) return;
  injected = true;
  const st = document.createElement('style');
  st.id = 'ocm-skeleton-styles';
  st.textContent = `
    .ocm-skel {
      position: relative;
      overflow: hidden;
      background: rgba(128,128,128,0.08);
      border-radius: 3px;
    }
    .ocm-skel::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(128,128,128,0.16), transparent);
      transform: translateX(-100%);
      animation: ocm-skel-sweep 1.4s ease-in-out infinite;
    }
    @keyframes ocm-skel-sweep { to { transform: translateX(100%); } }

    /* Fake chart: baseline bars of varying heights inside the block */
    .ocm-skel-chart {
      display: flex;
      align-items: flex-end;
      gap: 6%;
      padding: 12% 8% 10%;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
    }
    .ocm-skel-chart span {
      flex: 1;
      background: rgba(128,128,128,0.14);
      border-radius: 2px 2px 0 0;
    }
    @media (prefers-reduced-motion: reduce) {
      .ocm-skel::after { animation: none; }
    }
  `;
  document.head.appendChild(st);
}

/**
 * chartSkeleton()
 * Returns a skeleton element sized by its parent (width/height 100%),
 * with a subtle fake bar chart inside.
 */
export function chartSkeleton() {
  injectSkeletonStyles();
  const el = document.createElement('div');
  el.className = 'ocm-skel';
  el.style.cssText = 'width:100%;height:100%;';
  const bars = document.createElement('div');
  bars.className = 'ocm-skel-chart';
  [35, 55, 42, 70, 58, 80, 62, 90, 74, 66].forEach(h => {
    const b = document.createElement('span');
    b.style.height = h + '%';
    bars.appendChild(b);
  });
  el.appendChild(bars);
  return el;
}
