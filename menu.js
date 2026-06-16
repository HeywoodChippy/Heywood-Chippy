/**
 * HEYWOOD CHIPPY — MENU PAGE JS
 * Client-side search and category navigation.
 */

'use strict';

/* ── SEARCH ───────────────────────────────────────────────── */

function initMenuSearch() {
  const input    = document.getElementById('menu-search-input');
  const noResult = document.getElementById('no-results');
  if (!input) return;

  input.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll('.menu-item');
    let anyVisible = false;

    items.forEach(item => {
      const name = (item.dataset.name || '').toLowerCase();
      const desc = (item.dataset.desc || '').toLowerCase();
      const match = !q || name.includes(q) || desc.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    /* Show / hide category sections based on visible items */
    document.querySelectorAll('.menu-category').forEach(section => {
      const visibleItems = section.querySelectorAll('.menu-item:not([style*="none"])');
      const hasVisible = visibleItems.length > 0;
      section.style.display = !q || hasVisible ? '' : 'none';
    });

    noResult && noResult.classList.toggle('is-visible', !!q && !anyVisible);
  });
}

/* ── SIDEBAR ACTIVE INDICATOR ─────────────────────────────── */

function initSidebarIndicator() {
  const sidebar   = document.querySelector('.sidebar-nav');
  const indicator = document.querySelector('.sidebar-indicator');
  const links     = document.querySelectorAll('.sidebar-link');
  if (!sidebar || !indicator || !links.length) return;

  function moveIndicatorTo(link) {
    const sidebarRect = sidebar.getBoundingClientRect();
    const linkRect    = link.getBoundingClientRect();
    const offset      = linkRect.top - sidebarRect.top + sidebar.scrollTop;
    const height      = linkRect.height;
    indicator.style.transform  = `translateY(${offset}px)`;
    indicator.style.height     = `${height}px`;
  }

  /* Set initial position */
  const activeLink = sidebar.querySelector('.sidebar-link.active') || links[0];
  if (activeLink) {
    links.forEach(l => l.classList.remove('active'));
    activeLink.classList.add('active');
    moveIndicatorTo(activeLink);
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      moveIndicatorTo(link);
    });
  });

  /* Update active on scroll */
  const categories = document.querySelectorAll('.menu-category');
  const observerOptions = {
    rootMargin: '-30% 0px -65% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id  = entry.target.id;
        const cat = id.replace('cat-', '');
        const match = document.querySelector(`.sidebar-link[data-cat="${cat}"]`);
        if (match) {
          links.forEach(l => l.classList.remove('active'));
          match.classList.add('active');
          moveIndicatorTo(match);
        }
      }
    });
  }, observerOptions);

  categories.forEach(cat => observer.observe(cat));
}

/* ── MOBILE TAB NAV ───────────────────────────────────────── */

function initMobileTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      /* keep the active tab visible in the horizontal strip */
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      const cat    = tab.dataset.cat;
      const target = document.getElementById(`cat-${cat}`);
      if (!target) return;

      /* measured pixel offset (shared helper from global.js); never parse calc() */
      const offset = (typeof window.getScrollOffset === 'function')
        ? window.getScrollOffset()
        : 172;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
}

/* ── INIT ─────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initMenuSearch();
  initSidebarIndicator();
  initMobileTabs();
});
