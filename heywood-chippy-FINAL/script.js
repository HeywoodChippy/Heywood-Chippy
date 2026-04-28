/* =====================================================
   HEYWOOD CHIPPY v2 — script.js
   SPA Navigation | Scroll | Menu Spy | Form
   ===================================================== */

// =====================================================
// VIEW MANAGEMENT
// =====================================================
function showView(viewName) {
  document.querySelectorAll('.view').forEach(function (v) {
    v.classList.remove('active');
  });

  var target = document.getElementById('view-' + viewName);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.classList.remove('active');
    if (link.dataset.view === viewName) link.classList.add('active');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'menu') setTimeout(initMenuSpy, 300);

  setTimeout(observeAnimatables, 150);
}
window.showView = showView;


// =====================================================
// NAVBAR: SCROLL HIDE / SHOW
// =====================================================
(function () {
  var navbar     = document.getElementById('navbar');
  var lastScroll = 0;
  var threshold  = 80;

  window.addEventListener('scroll', function () {
    var current = window.pageYOffset;

    navbar.classList.toggle('scrolled', current > 60);

    if (current > threshold) {
      if (current > lastScroll) navbar.classList.add('hidden');
      else navbar.classList.remove('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    lastScroll = Math.max(0, current);
    handleScrollTop(current);
  }, { passive: true });
})();


// =====================================================
// SCROLL TO TOP
// =====================================================
var scrollTopBtn = document.getElementById('scrollTop');

function handleScrollTop(y) {
  scrollTopBtn.classList.toggle('visible', y > 400);
}

scrollTopBtn.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// =====================================================
// HAMBURGER MENU
// =====================================================
var hamburger     = document.getElementById('hamburger');
var mobileMenu    = document.getElementById('mobileMenu');
var mobileOverlay = document.getElementById('mobileOverlay');

function openMobileMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  mobileOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
window.closeMobileMenu = closeMobileMenu;

hamburger.addEventListener('click', function () {
  mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeMobileMenu();
});


// =====================================================
// MENU SCROLL SPY
// =====================================================
var menuSpyObserver = null;

function initMenuSpy() {
  var links    = document.querySelectorAll('.sidebar-link');
  var sections = document.querySelectorAll('.menu-section');
  if (!links.length || !sections.length) return;

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var el = document.getElementById(link.dataset.target);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });
    });
  });

  if (menuSpyObserver) menuSpyObserver.disconnect();

  menuSpyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        links.forEach(function (link) {
          link.classList.toggle('active', link.dataset.target === id);
        });
      }
    });
  }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 });

  sections.forEach(function (s) { menuSpyObserver.observe(s); });
}


// =====================================================
// CONTACT FORM
// =====================================================
(function () {
  var form    = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  if (!form) return;

  // Inject shake animation
  var style = document.createElement('style');
  style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}';
  document.head.appendChild(style);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name    = document.getElementById('name').value.trim();
    var email   = document.getElementById('email').value.trim();
    var message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      form.style.animation = 'none';
      form.offsetHeight;
      form.style.animation = 'shake 0.4s ease';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      var ei = document.getElementById('email');
      ei.style.borderColor = '#e53e3e';
      setTimeout(function () { ei.style.borderColor = ''; }, 2000);
      return;
    }

    form.style.opacity = '0.5';
    form.style.pointerEvents = 'none';
    setTimeout(function () {
      form.style.opacity = '1';
      form.style.pointerEvents = '';
      success.classList.add('show');
      form.reset();
      setTimeout(function () { success.classList.remove('show'); }, 6000);
    }, 700);
  });
})();


// =====================================================
// STAGGER SCROLL ANIMATIONS
// =====================================================
(function () {
  var style = document.createElement('style');
  style.textContent = [
    '.anim-item{opacity:0;transform:translateY(22px);transition:opacity 0.45s ease,transform 0.45s ease}',
    '.anim-item.visible{opacity:1;transform:translateY(0)}'
  ].join('');
  document.head.appendChild(style);
})();

var animObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      var delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(function () { entry.target.classList.add('visible'); }, delay);
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeAnimatables() {
  document.querySelectorAll('.featured-card, .value-card, .menu-item, .info-block, .stat-item').forEach(function (el, i) {
    if (!el.classList.contains('anim-item')) {
      el.classList.add('anim-item');
    }
    el.dataset.delay = (i % 5) * 70;
    animObserver.observe(el);
  });
}


// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', function () {
  showView('home');
  observeAnimatables();
});
