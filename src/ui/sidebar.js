/**
 * Sidebar navigation
 * Items are derived from the ocm-category-section elements present on the
 * page, in DOM order. No Webflow filter buttons required — adding a new
 * ocm-category-section to Webflow automatically adds it to the sidebar.
 */

export function initSidebar(onFilter) {
  const galleryView = document.querySelector('.ocm-gallery-view');
  if (!galleryView) return null;

  const sections = [...document.querySelectorAll('.ocm-category-section[data-category]')];
  if (!sections.length) return null;

  const nav = document.createElement('nav');
  nav.className = 'ocm-sidebar';

  const items = [];

  const makeItem = (label, filter, active = false) => {
    const item = document.createElement('div');
    item.className = 'ocm-sidebar-item' + (active ? ' ocm-sidebar-active' : '');
    item.textContent = label;
    item.dataset.filter = filter;
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('ocm-sidebar-active'));
      item.classList.add('ocm-sidebar-active');
      onFilter(filter);
    });
    nav.appendChild(item);
    items.push(item);
  };

  // "All" is always first
  makeItem('All', 'all', true);

  // One entry per section in page order; format "on-chain" → "On-Chain"
  sections.forEach(sec => {
    const cat   = sec.dataset.category;
    const label = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
    makeItem(label, cat);
  });

  // Sticky offset: the site navbar is fixed, so the sidebar must stop
  // below it (not slide underneath, where "All" becomes unclickable).
  const navbarH = _fixedNavbarHeight();
  if (navbarH) nav.style.top = `${navbarH + 16}px`;

  galleryView.insertBefore(nav, galleryView.firstChild);
  return nav;
}

// Height of the site's fixed/sticky top navbar, or 0 if none is found.
function _fixedNavbarHeight() {
  let el = document.querySelector('.w-nav, nav, header');
  while (el && el !== document.body) {
    const pos = getComputedStyle(el).position;
    if (pos === 'fixed' || pos === 'sticky') return el.getBoundingClientRect().height;
    el = el.parentElement;
  }
  return 0;
}
