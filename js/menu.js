/* ==============================================
   HEYWOOD CHIPPY — menu.js
   Category Scroll Spy · Menu Search Filter
   ============================================== */

(function () {
  'use strict';

  // ── Scroll Spy ───────────────────────────────────────
  var spyObserver = null;

  function initScrollSpy() {
    var links    = document.querySelectorAll('.sidebar-link');
    var sections = document.querySelectorAll('.menu-section');
    if (!links.length || !sections.length) return;

    // Click to scroll to section
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = link.dataset.target;
        var el       = document.getElementById(targetId);
        if (el) {
          var navbar  = document.getElementById('navbar');
          var headerH = navbar ? (navbar.offsetTop + navbar.offsetHeight + 16) : 116;
          var offset  = el.getBoundingClientRect().top + window.pageYOffset - headerH;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });

    if (spyObserver) spyObserver.disconnect();

    spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          links.forEach(function (link) {
            link.classList.toggle('active', link.dataset.target === id);
          });
        }
      });
    }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  // ── Menu Search Filter ───────────────────────────────
  function initSearch() {
    var searchInput  = document.getElementById('menuSearch');
    var noResults    = document.querySelector('.search-no-results');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();

      var allItems = document.querySelectorAll('.menu-item');
      allItems.forEach(function (item) {
        var name = (item.querySelector('.mi-name') || {}).textContent || '';
        var desc = (item.querySelector('.mi-desc') || {}).textContent || '';
        var hit  = !q || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
        item.style.display = hit ? '' : 'none';
      });

      // Also handle kids-card, special-card visibility
      var specialCard = document.querySelector('.special-card');
      if (specialCard && q) {
        var text = specialCard.textContent.toLowerCase();
        specialCard.style.display = text.includes(q) ? '' : 'none';
      } else if (specialCard) {
        specialCard.style.display = '';
      }

      // Show/hide entire sections
      var anyVisible = false;
      document.querySelectorAll('.menu-section').forEach(function (section) {
        var visItems  = section.querySelectorAll('.menu-item');
        var someShown = false;

        if (visItems.length) {
          visItems.forEach(function (it) {
            if (it.style.display !== 'none') someShown = true;
          });
        } else {
          // Kids card / special card with no .menu-item
          var card = section.querySelector('.special-card, .kids-card');
          if (card && card.style.display !== 'none') someShown = true;
        }

        section.style.display = (!q || someShown) ? '' : 'none';
        if (someShown || !q) anyVisible = true;
      });

      if (noResults) {
        noResults.classList.toggle('show', q.length > 0 && !anyVisible);
      }
    });

    // Clear on Escape
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        this.dispatchEvent(new Event('input'));
        this.blur();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollSpy();
    initSearch();
  });

})();
