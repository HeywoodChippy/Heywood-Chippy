/* ==============================================
   HEYWOOD CHIPPY — nav.js
   Navbar scroll · Hamburger · Open/Closed badge · Page transitions
   ============================================== */

(function () {
  'use strict';

  var navbar        = document.getElementById('navbar');
  var hamburger     = document.getElementById('hamburger');
  var mobileMenu    = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var scrollTopBtn  = document.getElementById('scrollTop');
  var progress      = document.getElementById('scrollProgress');

  // ── Navbar Scroll Behaviour ──────────────────────────
  var lastScroll = 0;
  var threshold  = 80;

  window.addEventListener('scroll', function () {
    var y = window.pageYOffset;

    navbar.classList.toggle('scrolled', y > 60);

    if (y > threshold) {
      navbar.classList.toggle('hidden', y > lastScroll);
    } else {
      navbar.classList.remove('hidden');
    }
    lastScroll = Math.max(0, y);

    // Scroll to top visibility
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 420);

    // Scroll progress bar
    if (progress) {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = docH > 0 ? (y / docH * 100) + '%' : '0%';
    }
  }, { passive: true });

  // ── Scroll to Top ────────────────────────────────────
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Hamburger / Mobile Menu ──────────────────────────
  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
  }
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ── Active Nav Link ──────────────────────────────────
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Page Transition on Link Click ────────────────────
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http')) return;
    // Only internal .html links
    link.addEventListener('click', function (e) {
      var target = this.getAttribute('href');
      if (!target || target.startsWith('#')) return;
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(function () { window.location.href = target; }, 280);
    });
  });

  // ── Real-time Open / Closed Badge ────────────────────
  var badge = document.getElementById('openBadge');
  if (badge) {
    function updateBadge() {
      var now  = new Date();
      var day  = now.getDay();  // 0=Sun
      var mins = now.getHours() * 60 + now.getMinutes();
      var open = day >= 1 && day <= 6 && mins >= 720 && mins < 1260; // 12:00–21:00

      var dot  = badge.querySelector('.open-dot');
      var text = badge.querySelector('.open-text');

      if (open) {
        badge.classList.remove('closed');
        if (dot)  dot.style.background  = '#4ade80';
        if (text) text.textContent = 'Open Now';
      } else {
        badge.classList.add('closed');
        if (dot)  dot.style.background  = '#f87171';
        if (dot)  dot.style.boxShadow   = '0 0 6px rgba(248,113,113,.6)';
        var msg = 'Closed';
        if (day === 0) msg = 'Closed Sunday';
        if (text) text.textContent = msg;
      }
    }
    updateBadge();
    setInterval(updateBadge, 60000);
  }

  // ── Hero BG Zoom ─────────────────────────────────────
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    setTimeout(function () { heroBg.classList.add('loaded'); }, 100);
  }

})();
