/**
 * Sidebar navigation — replaces the top filter bar (.ocm-data-filters)
 * on the gallery view. Injected at runtime so no Webflow structural
 * change is required.
 *
 * Reuses the existing filter buttons' labels/values (harvested from
 * the hidden .ocm-filter-btn nav) so wording stays in sync with
 * whatever is authored in Webflow.
 */

/**
 * initSidebar(onFilter)
 * @param {Function} onFilter — called with the filter value ('all' | category)
 * @returns {HTMLElement} the sidebar nav element
 */
export function initSidebar(onFilter) {
  const galleryView = document.querySelector('.ocm-gallery-view');
  const sourceBtns   = document.querySelectorAll('.ocm-data-filters .ocm-filter-btn');
  if (!galleryView || !sourceBtns.length) return null;

  const nav = document.createElement('nav');
  nav.className = 'ocm-sidebar';

  const items = [...sourceBtns].map(src => {
    const item = document.createElement('div');
    item.className   = 'ocm-sidebar-item';
    item.textContent = src.textContent.trim();
    item.dataset.filter = src.dataset.filter;
    if (src.classList.contains('ocm-filter-active')) item.classList.add('ocm-sidebar-active');

    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('ocm-sidebar-active'));
      item.classList.add('ocm-sidebar-active');
      onFilter(item.dataset.filter);
    });

    nav.appendChild(item);
    return item;
  });

  galleryView.insertBefore(nav, galleryView.firstChild);
  return nav;
}
