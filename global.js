/**
 * HEYWOOD CHIPPY — GLOBAL JS
 * Shared across all pages. Load deferred at end of <body>.
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   OWNER · DELIVERY ORDERING LINKS  ←←← EDIT THESE 4 LINES ONLY
   Paste each platform URL once between the quotes. They are applied
   to every delivery button across the WHOLE site (home + menu).
   Leave '' empty and the button stays as a placeholder.
═══════════════════════════════════════════════════════════════ */
const PLATFORM_URLS = {
  orderyoyo: '',   /* OWNER: your OrderYOYO link  */
  justeat:   '',   /* OWNER: your Just Eat link   */
  ubereats:  '',   /* OWNER: your Uber Eats link  */
  deliveroo: ''    /* OWNER: your Deliveroo link  */
};

function initPlatformLinks() {
  document.querySelectorAll('a[data-platform]').forEach(a => {
    const url = PLATFORM_URLS[a.dataset.platform];
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.classList.remove('is-pending');
    } else {
      a.classList.add('is-pending');   /* subtle "link coming" state */
    }
  });
}

/* ── OPEN / CLOSED LOGIC ──────────────────────────────────────── */

function isOpenNow() {
  const now  = new Date();
  const day  = now.getDay();                              // 0 = Sunday
  const time = now.getHours() * 60 + now.getMinutes();   // minutes since midnight
  if (day === 0) return false;                            // Sunday: always closed
  return time >= 720 && time < 1260;                     // 12:00–21:00
}

function renderLiveBadge(el) {
  if (!el) return;
  const open = isOpenNow();
  el.className = 'live-badge ' + (open ? 'live-badge--open' : 'live-badge--closed');
  el.innerHTML = `<span class="badge-dot"></span>${open ? 'Open Now' : 'Closed'}`;
}

function initLiveBadges() {
  const badges = document.querySelectorAll('[data-live-badge]');
  badges.forEach(renderLiveBadge);
  setInterval(() => badges.forEach(renderLiveBadge), 60_000);
}

/* ── ANNOUNCEMENT BAR ─────────────────────────────────────────── */

function initAnnouncementBar() {
  const bar     = document.querySelector('.announcement-bar');
  const dismiss = document.querySelector('.announcement-bar__dismiss');
  const nav     = document.querySelector('.site-nav');
  if (!bar) return;

  function applyBarState(hidden) {
    if (hidden) {
      bar.classList.add('is-hidden');
      nav && nav.classList.remove('bar-visible');
      nav && nav.classList.add('bar-hidden');
    } else {
      bar.classList.remove('is-hidden');
      nav && nav.classList.add('bar-visible');
      nav && nav.classList.remove('bar-hidden');
    }
  }

  const isDismissed = localStorage.getItem('bar-dismissed') === 'true';
  applyBarState(isDismissed);

  dismiss && dismiss.addEventListener('click', () => {
    localStorage.setItem('bar-dismissed', 'true');
    bar.style.transition = 'opacity 250ms ease, height 300ms ease';
    bar.style.opacity    = '0';
    bar.style.overflow   = 'hidden';
    setTimeout(() => {
      bar.style.height = '0';
      bar.style.borderWidth = '0';
    }, 50);
    setTimeout(() => {
      applyBarState(true);
      bar.style.cssText = '';
    }, 380);
  });
}

/* ── NAV SCROLL BEHAVIOUR ─────────────────────────────────────── */

function initNavScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrolled = window.scrollY > 20;
      nav.classList.toggle('is-scrolled', scrolled);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── MOBILE HAMBURGER BUBBLE ──────────────────────────────────── */

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const bubble    = document.querySelector('.mobile-nav-bubble');
  if (!hamburger || !bubble) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('is-open');
    bubble.classList.remove('is-closing');
    bubble.classList.add('is-open');
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    hamburger.classList.remove('is-open');
    bubble.classList.remove('is-open');
    bubble.classList.add('is-closing');
    setTimeout(() => {
      bubble.classList.remove('is-closing');
    }, 180);
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen ? closeMenu() : openMenu();
  });

  document.addEventListener('click', (e) => {
    if (!bubble.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  bubble.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
  });
}

/* ── SCROLL PROGRESS BAR ──────────────────────────────────────── */

function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  function update() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct.toFixed(2) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── REVEAL ANIMATIONS (IntersectionObserver) ─────────────────── */

function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  });

  els.forEach(el => observer.observe(el));
}

/* ── COUNTER ANIMATION ────────────────────────────────────────── */

function animateCounter(el) {
  const target   = parseFloat(el.dataset.count);
  const suffix   = el.dataset.suffix || '';
  const prefix   = el.dataset.prefix || '';
  const duration = 1200;
  const start    = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = easeOut(progress) * target;
    el.textContent = prefix + (Number.isInteger(target)
      ? Math.round(value)
      : value.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => {
    el.textContent = el.dataset.prefix || '0';
    observer.observe(el);
  });
}

/* ── MAGNETIC BUTTON ──────────────────────────────────────────── */

function initMagneticButton() {
  const magnets = document.querySelectorAll('.btn-magnetic');
  if (!magnets.length) return;

  magnets.forEach(wrap => {
    const inner = wrap.querySelector('.btn');
    if (!inner) return;
    const MAX = 8;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      inner.style.transform = `translate(${dx * MAX}px, ${dy * MAX}px)`;
    });

    wrap.addEventListener('mouseleave', () => {
      inner.style.transform = '';
      inner.style.transition = `transform 400ms ${getComputedStyle(document.documentElement)
        .getPropertyValue('--ease-out').trim()}`;
      setTimeout(() => { inner.style.transition = ''; }, 400);
    });
  });
}

/* ── BUTTON RIPPLE ────────────────────────────────────────────── */

function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    btn.classList.remove('is-rippling');
    void btn.offsetWidth;
    btn.classList.add('is-rippling');
    setTimeout(() => btn.classList.remove('is-rippling'), 520);
  });
}

/* ── SMOOTH SCROLL OFFSET ─────────────────────────────────────── */

/* Measure the real fixed-header height in PIXELS.
   (Never parseInt a CSS custom property that holds calc() — it yields NaN
   and scrollTo({top: NaN}) silently jumps to the top of the page.) */
function getScrollOffset() {
  const nav = document.querySelector('.site-nav');
  let offset = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 112;
  const tabs = document.querySelector('.menu-tabs-mobile');
  if (tabs && getComputedStyle(tabs).display !== 'none') {
    offset += tabs.getBoundingClientRect().height;
  }
  return offset + 12;
}
window.getScrollOffset = getScrollOffset;

function initSmoothScrollOffset() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
}

/* ── HERO WORD ANIMATION ──────────────────────────────────────── */

function initHeroWordReveal() {
  const h1 = document.querySelector('.hero-title');
  if (!h1) return;

  const text = h1.textContent;
  h1.innerHTML = text.split(' ').map((word, i) =>
    `<span class="hero-word" style="animation-delay:${500 + i * 80}ms">${word}</span>`
  ).join(' ');
}

/* ── PARALLAX HERO ────────────────────────────────────────────── */

function initParallax() {
  const hero = document.querySelector('.hero-bg');
  if (!hero) return;

  let ticking = false;
  function update() {
    const scrollY = window.scrollY;
    hero.style.transform = `translateY(${scrollY * 0.35}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* ── PAGE LOAD ANIMATION ──────────────────────────────────────── */

function initPageLoad() {
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
  });
}

/* ── ACTIVE NAV LINK ──────────────────────────────────────────── */

function initActiveNavLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-bubble a, .footer-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current ||
       (current === '' && href === 'index.html') ||
       (current === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── INIT ─────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initAnnouncementBar();
  initNavScroll();
  initMobileMenu();
  initScrollProgress();
  initReveal();
  initCounters();
  initMagneticButton();
  initRipple();
  initSmoothScrollOffset();
  initHeroWordReveal();
  initParallax();
  initLiveBadges();
  initActiveNavLink();
  initPlatformLinks();
  document.body.classList.add('loaded');
});
