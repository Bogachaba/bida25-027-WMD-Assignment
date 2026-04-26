/* ═══════════════════════════════════════════════
   CAFE DE LA PARIS — gallery.js
   ═══════════════════════════════════════════════ */

'use strict';

/* ──────────────── DATA ──────────────── */
const galleryData = [
  { src: 'images/food-01.jpg',    title: 'Seared Duck Confit',   sub: "Chef's Signature · Season 2024", cat: 'food' },
  { src: 'images/ambiance-01.jpg',title: 'The Main Hall',         sub: 'Interior · Evening Light',        cat: 'ambiance' },
  { src: 'images/drinks-01.jpg',  title: 'Château Reserve',       sub: 'Wine · House Selection',          cat: 'drinks' },
  { src: 'images/food-02.jpg',    title: 'Pan-Seared Sea Bass',   sub: 'Seafood · À la Carte',            cat: 'food' },
  { src: 'images/events-01.jpg',  title: 'Anniversary Evening',   sub: 'Private Event · June 2024',       cat: 'events' },
  { src: 'images/ambiance-02.jpg',title: 'Candlelit Terrace',     sub: 'Outdoor Dining · Sunset',         cat: 'ambiance' },
  { src: 'images/food-03.jpg',    title: 'Truffle Risotto',       sub: 'Vegetarian · Daily Special',      cat: 'food' },
  { src: 'images/drinks-02.jpg',  title: 'La Parisienne',         sub: 'Signature Cocktail · Bar',        cat: 'drinks' },
  { src: 'images/ambiance-03.jpg',title: 'Private Dining Room',   sub: 'Interior · North Wing',           cat: 'ambiance' },
  { src: 'images/food-04.jpg',    title: 'Artisan Bread Board',   sub: 'Starter · House-Baked',           cat: 'food' },
  { src: 'images/events-02.jpg',  title: 'Jazz Night',            sub: 'Live Music · Every Friday',       cat: 'events' },
  { src: 'images/drinks-03.jpg',  title: 'Morning Espresso',      sub: 'Coffee · Morning Service',        cat: 'drinks' },
];

/* ──────────────── STATE ──────────────── */
let currentIndex = 0;
let activeFilter = 'all';
let visibleIndices = galleryData.map((_, i) => i); // all visible by default

/* ──────────────── ELEMENTS ──────────────── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
const lightbox   = document.getElementById('lightbox');
const lbBackdrop = document.getElementById('lightboxBackdrop');
const lbImg      = document.getElementById('lightboxImg');
const lbLoader   = document.getElementById('lightboxLoader');
const lbTitle    = document.getElementById('lbTitle');
const lbSub      = document.getElementById('lbSub');
const lbNum      = document.getElementById('lbNum');
const lbTag      = document.getElementById('lbTag');
const mainNav    = document.getElementById('mainNav');
const hamburger  = document.getElementById('hamburger');
const drawer     = document.getElementById('mobileDrawer');

/* ──────────────── CURSOR ──────────────── */
(function initCursor() {
  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverables = 'a, button, .gallery-item, .filter-btn, .expand-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.matches(hoverables) || e.target.closest(hoverables)) {
      cursor.classList.add('hovering');
      cursorRing.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches(hoverables) || e.target.closest(hoverables)) {
      cursor.classList.remove('hovering');
      cursorRing.classList.remove('hovering');
    }
  });
})();

/* ──────────────── NAV SCROLL ──────────────── */
(function initNav() {
  window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    drawer.classList.toggle('open');
  });
})();

/* ──────────────── SCROLL REVEAL ──────────────── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children in the same grid
        const delay = entry.target.dataset.revealDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  // Add stagger delay to grid items
  document.querySelectorAll('.gallery-grid').forEach(grid => {
    const children = grid.querySelectorAll('.reveal');
    children.forEach((el, i) => {
      el.dataset.revealDelay = i * 80;
    });
  });

  items.forEach(el => io.observe(el));
})();

/* ──────────────── FILTER ──────────────── */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const count = document.getElementById('filterCount');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      if (filter === activeFilter) return;
      activeFilter = filter;

      // Update button states
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update visibleIndices
      visibleIndices = [];
      let shown = 0;

      items.forEach(item => {
        const cat   = item.dataset.cat;
        const idx   = parseInt(item.dataset.index, 10);
        const match = filter === 'all' || cat === filter;

        item.classList.toggle('hidden', !match);

        if (match) {
          visibleIndices.push(idx);
          shown++;
        }
      });

      if (count) count.textContent = shown;
    });
  });
})();

/* ──────────────── LIGHTBOX ──────────────── */
function openLightbox(index) {
  currentIndex = index;
  renderLightbox(index);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleKey);
}

function renderLightbox(index) {
  const data = galleryData[index];
  if (!data) return;

  // Show loader
  lbImg.classList.remove('loaded');
  lbLoader.classList.remove('hidden');

  // Set info
  const visPos  = visibleIndices.indexOf(index);
  const total   = visibleIndices.length;
  const display = visPos >= 0 ? visPos + 1 : index + 1;
  lbNum.textContent   = String(display).padStart(2, '0') + ' / ' + String(total || galleryData.length).padStart(2, '0');
  lbTitle.textContent = data.title;
  lbSub.textContent   = data.sub;
  lbTag.textContent   = data.cat;

  // Load image
  const img   = new Image();
  img.src     = data.src;
  img.alt     = data.title;
  img.onload  = () => {
    lbImg.src = data.src;
    lbImg.alt = data.title;
    lbImg.classList.add('loaded');
    lbLoader.classList.add('hidden');
  };
  img.onerror = () => {
    lbLoader.classList.add('hidden');
    lbImg.style.opacity = '0.3';
  };
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKey);
}

function navLightbox(direction) {
  const pool = visibleIndices.length > 0 ? visibleIndices : galleryData.map((_, i) => i);
  const pos  = pool.indexOf(currentIndex);
  const next = (pos + direction + pool.length) % pool.length;
  currentIndex = pool[next];
  renderLightbox(currentIndex);
}

function handleKey(e) {
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  navLightbox(1);
  if (e.key === 'ArrowLeft')   navLightbox(-1);
}

// Wire gallery items to lightbox
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const idx = parseInt(item.dataset.index, 10);
    openLightbox(idx);
  });
});

// Close on backdrop click
lbBackdrop.addEventListener('click', closeLightbox);
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('prevBtn').addEventListener('click', (e) => { e.stopPropagation(); navLightbox(-1); });
document.getElementById('nextBtn').addEventListener('click', (e) => { e.stopPropagation(); navLightbox(1); });

/* ──────────────── TOUCH SWIPE (lightbox) ──────────────── */
(function initSwipe() {
  let startX = 0;
  const inner = document.querySelector('.lightbox-inner');

  inner.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  inner.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      navLightbox(diff > 0 ? 1 : -1);
    }
  }, { passive: true });
})();

/* ──────────────── FEATURE STRIP PARALLAX ──────────────── */
(function initParallax() {
  const strip = document.querySelector('.feature-strip');
  const img   = strip ? strip.querySelector('.feature-img') : null;
  if (!img) return;

  window.addEventListener('scroll', () => {
    const rect   = strip.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const offset = (center - window.innerHeight / 2) * 0.12;
    img.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
})();