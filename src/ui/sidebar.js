/**
 * Sidebar navigation
 * One entry per ocm-category-section, in DOM order. Clicking an entry
 * smooth-scrolls to that section; as the reader scrolls, the entry for the
 * section currently under the navbar is highlighted (scrollspy). No "All"
 * button and no filtering — every section is always on the page.
 *
 * Adding a new ocm-category-section in Webflow automatically adds it here.
 */

export function initSidebar() {
  const galleryView = document.querySelector('.ocm-gallery-view');
  if (!galleryView) return null;

  const sections = [...document.querySelectorAll('.ocm-category-section[data-category]')];
  if (!sections.length) return null;

  const navbarH = _fixedNavbarHeight();
  // Expose the navbar height to CSS so the sidebar (sticky on desktop AND
  // mobile) can park itself just below the fixed site navbar.
  document.documentElement.style.setProperty('--ocm-nav-h', `${navbarH}px`);

  const nav = document.createElement('nav');
  nav.className = 'ocm-sidebar';

  const items = [];
  const setActive = cat => items.forEach(i =>
    i.classList.toggle('ocm-sidebar-active', i.dataset.filter === cat)
  );

  // One entry per section in page order; format "on-chain" → "On-Chain".
  sections.forEach((sec, idx) => {
    const cat   = sec.dataset.category;
    const label = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
    const item  = document.createElement('div');
    item.className = 'ocm-sidebar-item' + (idx === 0 ? ' ocm-sidebar-active' : '');
    item.textContent = label;
    item.dataset.filter = cat;
    item.addEventListener('click', () => {
      setActive(cat);
      _scrollToSection(sec, navbarH, nav);
    });
    nav.appendChild(item);
    items.push(item);
  });

  galleryView.insertBefore(nav, galleryView.firstChild);

  // Scrollspy: highlight the entry for whichever section currently sits
  // under the navbar. rAF-throttled so scrolling stays smooth.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const line = navbarH + _stickyBarHeight(nav) + 24;
      let current = sections[0].dataset.category;
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top - line <= 0) current = sec.dataset.category;
        else break;
      }
      setActive(current);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  return nav;
}

// Smooth-scroll a section to just below the navbar (and, on mobile, below
// the category bar, which is sticky there and would otherwise cover it).
function _scrollToSection(sec, navbarH, nav) {
  const offset = navbarH + _stickyBarHeight(nav) + 16;
  const top = sec.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// The category bar only reserves vertical space when it is laid out as the
// horizontal sticky bar (mobile). Beside the content (desktop) it takes none.
function _stickyBarHeight(nav) {
  return getComputedStyle(nav).flexDirection === 'row'
    ? nav.getBoundingClientRect().height
    : 0;
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
