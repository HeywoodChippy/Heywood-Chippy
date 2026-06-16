/**
 * HEYWOOD CHIPPY — MAXIMALIST EFFECTS ENGINE
 * Three.js hero scene · 3D pointer/gyro tilt · scroll depth · call FAB.
 * Loads after global.js. Three.js (UMD, window.THREE) loaded before this.
 * Everything is feature-guarded and respects prefers-reduced-motion.
 */

'use strict';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = window.matchMedia('(hover: none)').matches;

/* Shared pointer state (-1..1) fed to hero scene + scenes */
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

window.addEventListener('pointermove', (e) => {
  pointer.tx = (e.clientX / window.innerWidth)  * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

/* ════════════════════════════════════════════════════
   1 · THREE.JS HERO — floating golden chips, fish & peas
══════════════════════════════════════════════════════ */

function initHeroScene() {
  if (REDUCED || !window.THREE) return;
  const canvas = document.querySelector('.hero-canvas');
  const hero   = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const THREE = window.THREE;
  const isMobile = window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(hero.clientWidth, hero.clientHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, hero.clientWidth / hero.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const group = new THREE.Group();
  scene.add(group);

  /* ── Lighting: warm gold key + cool navy fill + gold rim ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const key = new THREE.DirectionalLight(0xffe6a8, 2.0);
  key.position.set(5, 6, 8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x2a4a7a, 1.1);
  fill.position.set(-6, -2, 4);
  scene.add(fill);

  const rim = new THREE.PointLight(0xc9a84c, 2.2, 40);
  rim.position.set(-4, 4, -6);
  scene.add(rim);

  /* ── Materials ── */
  const matBatter = new THREE.MeshStandardMaterial({ color: 0xe8a33d, roughness: 0.50, metalness: 0.12, emissive: 0x6b4410, emissiveIntensity: 0.7 });
  const matChip   = new THREE.MeshStandardMaterial({ color: 0xf2c878, roughness: 0.45, metalness: 0.10, emissive: 0x5a3c08, emissiveIntensity: 0.65 });
  const matGold   = new THREE.MeshStandardMaterial({ color: 0xe8c97a, roughness: 0.25, metalness: 0.60, emissive: 0x3a2c08, emissiveIntensity: 0.6 });
  const matPea    = new THREE.MeshStandardMaterial({ color: 0x8fc24a, roughness: 0.40, metalness: 0.05, emissive: 0x24380c, emissiveIntensity: 0.7 });

  const floaters = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  function place(mesh, spread) {
    mesh.position.set(rand(-spread, spread), rand(-spread * 0.7, spread * 0.7), rand(-5, 2));
    mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    mesh.userData = {
      rs: { x: rand(-0.004, 0.004), y: rand(-0.005, 0.005), z: rand(-0.003, 0.003) },
      fl: rand(0, Math.PI * 2),
      fs: rand(0.25, 0.6),
      fa: rand(0.06, 0.16)
    };
    group.add(mesh);
    floaters.push(mesh);
  }

  /* Chips — elongated rounded bars */
  const chipGeo = new THREE.BoxGeometry(0.34, 0.34, 2.0);
  const chipCount = isMobile ? 8 : 15;
  for (let i = 0; i < chipCount; i++) {
    place(new THREE.Mesh(chipGeo, Math.random() > 0.5 ? matChip : matGold), 6.2);
  }

  /* Battered fish fillets — flattened ellipsoids */
  const fishGeo = new THREE.SphereGeometry(0.9, 24, 16);
  const fishCount = isMobile ? 2 : 4;
  for (let i = 0; i < fishCount; i++) {
    const m = new THREE.Mesh(fishGeo, matBatter);
    m.scale.set(1.5, 0.42, 0.95);
    place(m, 5.5);
  }

  /* Mushy peas — pops of fish-and-chips green */
  const peaGeo = new THREE.SphereGeometry(0.16, 16, 12);
  const peaCount = isMobile ? 6 : 12;
  for (let i = 0; i < peaCount; i++) {
    place(new THREE.Mesh(peaGeo, matPea), 6);
  }

  /* ── Golden bokeh particle dust ── */
  const pCount = isMobile ? 60 : 160;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3]     = rand(-9, 9);
    pPos[i * 3 + 1] = rand(-6, 6);
    pPos[i * 3 + 2] = rand(-6, 3);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xeccf86, size: 0.06, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Device orientation (mobile gyro) ── */
  const gyro = { x: 0, y: 0 };
  if (IS_TOUCH && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      gyro.x = Math.max(-1, Math.min(1, e.gamma / 45));        // left-right
      gyro.y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));  // front-back
    }, { passive: true });
  }

  /* ── Animation loop (paused when hero off-screen) ── */
  let running = true;
  const io = new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
    if (running) tick();
  }, { threshold: 0.01 });
  io.observe(hero);

  const clock = new THREE.Clock();

  function tick() {
    if (!running) return;
    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    const aimX = IS_TOUCH ? gyro.x : pointer.x;
    const aimY = IS_TOUCH ? gyro.y : pointer.y;

    group.rotation.y += ((aimX * 0.5) - group.rotation.y) * 0.05;
    group.rotation.x += ((aimY * 0.3) - group.rotation.x) * 0.05;

    floaters.forEach((m) => {
      const u = m.userData;
      m.rotation.x += u.rs.x;
      m.rotation.y += u.rs.y;
      m.rotation.z += u.rs.z;
      m.position.y += Math.sin(t * u.fs + u.fl) * u.fa * 0.02;
    });

    particles.rotation.y = t * 0.02;
    camera.position.x += (aimX * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-aimY * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  /* ── Resize ── */
  let rT;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      camera.aspect = hero.clientWidth / hero.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(hero.clientWidth, hero.clientHeight);
    }, 150);
  }, { passive: true });
}

/* ════════════════════════════════════════════════════
   2 · 3D POINTER TILT (cards)
══════════════════════════════════════════════════════ */

function initTilt() {
  if (IS_TOUCH || REDUCED) return;
  const max = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tilt-max')) || 10;

  document.querySelectorAll('.tilt').forEach((el) => {
    let raf = null;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * max * 2;
      const ry = (px - 0.5) * max * 2;

      el.style.setProperty('--mx', (px * 100) + '%');
      el.style.setProperty('--my', (py * 100) + '%');

      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.transform =
          `perspective(var(--perspective)) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-8px)`;
        raf = null;
      });
    });

    el.addEventListener('pointerenter', () => el.classList.add('is-tilting'));
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-tilting');
      el.style.transform = '';
    });
  });
}

/* ════════════════════════════════════════════════════
   3 · DEVICE TILT (mobile glass parallax)
══════════════════════════════════════════════════════ */

function initDeviceTilt() {
  if (!IS_TOUCH || REDUCED || !window.DeviceOrientationEvent) return;
  const cards = document.querySelectorAll('.tilt');
  if (!cards.length) return;

  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    const ry = Math.max(-6, Math.min(6, e.gamma / 6));
    const rx = Math.max(-6, Math.min(6, (e.beta - 45) / 8));
    cards.forEach((el) => {
      el.style.transform =
        `perspective(var(--perspective)) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
  }, { passive: true });
}

/* ════════════════════════════════════════════════════
   4 · SCROLL DEPTH / PARALLAX
══════════════════════════════════════════════════════ */

function initScrollDepth() {
  if (REDUCED) return;
  const items = document.querySelectorAll('[data-parallax]');
  const hero  = document.querySelector('.hero-content');

  let ticking = false;
  function update() {
    const y = window.scrollY;

    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    });

    if (hero) {
      const vh = window.innerHeight;
      const p  = Math.min(y / vh, 1);
      hero.style.transform = `translateY(${(y * 0.15).toFixed(1)}px) scale(${(1 - p * 0.06).toFixed(3)})`;
      hero.style.opacity = (1 - p * 0.9).toFixed(2);
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* ════════════════════════════════════════════════════
   5 · DESKTOP CALL FAB (appears after hero)
══════════════════════════════════════════════════════ */

function initCallFab() {
  const fab = document.querySelector('.call-fab');
  if (!fab) return;
  function update() {
    fab.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ════════════════════════════════════════════════════
   6 · LIVE PULSE DOT IN MOBILE CALL BAR
══════════════════════════════════════════════════════ */

function initMobilePulse() {
  const pulse = document.querySelector('.mobile-cta-pulse');
  if (!pulse) return;
  function sync() {
    const open = typeof isOpenNow === 'function' ? isOpenNow() : true;
    pulse.classList.toggle('mobile-cta-pulse--closed', !open);
  }
  sync();
  setInterval(sync, 60_000);
}

/* ════════════════════════════════════════════════════
   7 · CUSTOM GOLD CURSOR + TRAIL
══════════════════════════════════════════════════════ */

function initCursor() {
  if (REDUCED) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  document.body.append(ring, dot);
  document.body.classList.add('has-custom-cursor');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my, lastTrail = 0;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

    const now = performance.now();
    if (now - lastTrail > 35) {
      lastTrail = now;
      const t = document.createElement('div');
      t.className = 'cursor-trail';
      t.style.left = mx + 'px';
      t.style.top  = my + 'px';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 600);
    }
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('a, button, input, textarea, .tilt, .platform-btn')) ring.classList.add('is-hot');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('a, button, input, textarea, .tilt, .platform-btn')) ring.classList.remove('is-hot');
  });
  window.addEventListener('blur', () => { ring.style.opacity = '0'; dot.style.opacity = '0'; });
  window.addEventListener('focus', () => { ring.style.opacity = '1'; dot.style.opacity = '1'; });
}

/* ════════════════════════════════════════════════════
   8 · ONE-TIME INTRO LOADER (once per browser session)
══════════════════════════════════════════════════════ */

function initIntro() {
  const loader = document.querySelector('.intro-loader');
  if (!loader) return;
  if (REDUCED) { loader.remove(); return; }
  try {
    if (sessionStorage.getItem('hc-intro')) { loader.remove(); return; }
    sessionStorage.setItem('hc-intro', '1');
  } catch (e) { /* private mode — just play it */ }
  setTimeout(() => loader.remove(), 2600);
}

/* ════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initHeroScene();
  initTilt();
  initDeviceTilt();
  initScrollDepth();
  initCallFab();
  initMobilePulse();
  initCursor();
});
