/* ==============================================
   HEYWOOD CHIPPY — animations.js
   Scroll Reveal · Animated Counters
   ============================================== */

(function () {
  'use strict';

  // ── Scroll Reveal ────────────────────────────────────
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeReveal() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ── Animated Counters ────────────────────────────────
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function animateCount(el) {
    var target   = parseFloat(el.dataset.target || el.textContent);
    var suffix   = el.dataset.suffix || '';
    var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    var duration = 1600;
    var start    = performance.now();

    function tick(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      var val      = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function observeCounters() {
    document.querySelectorAll('.stat-num[data-target]').forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ── Init ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    observeReveal();
    observeCounters();
  });

  // Also run on load in case DOMContentLoaded already fired
  if (document.readyState !== 'loading') {
    observeReveal();
    observeCounters();
  }

})();
