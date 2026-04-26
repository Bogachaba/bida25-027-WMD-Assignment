/* ============================================================
   CAFE DE LA PARIS — index.js
   ============================================================ */

/* ── Custom Cursor ── */
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animTrail() {
  tx += (mx - tx) * 0.1;
  ty += (my - ty) * 0.1;
  trail.style.left = tx + 'px';
  trail.style.top  = ty + 'px';
  requestAnimationFrame(animTrail);
})();

/* Scale cursor on interactive elements */
const hoverEls = document.querySelectorAll(
  'a, button, .menu-card, .review-card, .gallery-item'
);
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width  = '16px';
    cursor.style.height = '16px';
    trail.style.width   = '54px';
    trail.style.height  = '54px';
    trail.style.opacity = '.5';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width  = '8px';
    cursor.style.height = '8px';
    trail.style.width   = '32px';
    trail.style.height  = '32px';
    trail.style.opacity = '1';
  });
});

/* ── Navbar scroll behaviour ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── Mobile Nav ── */
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

hamburger.addEventListener('click', () => {
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
});

mobileClose.addEventListener('click', closeMobileNav);
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

function closeMobileNav() {
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Scroll Reveal ── */
const revealEls = document.querySelectorAll('.reveal-section');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));

/* ── Reviews Slider ── */
const track      = document.getElementById('reviewsTrack');
const dotsWrap   = document.getElementById('reviewsDots');
const cards      = track ? Array.from(track.children) : [];
let   currentSlide = 0;
let   slideTimer;

if (cards.length && dotsWrap) {
  /* Build dots */
  cards.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Review ${i + 1}`);
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(btn);
  });

  function goToSlide(i) {
    currentSlide = i;
    const cardW  = cards[0].offsetWidth + 24; /* card width + gap */
    track.style.transform = `translateX(-${currentSlide * cardW}px)`;
    dotsWrap.querySelectorAll('button').forEach((b, idx) => {
      b.classList.toggle('active', idx === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % cards.length);
  }

  /* Auto-advance every 4s */
  function startTimer() {
    slideTimer = setInterval(nextSlide, 4000);
  }
  function resetTimer() {
    clearInterval(slideTimer);
    startTimer();
  }

  startTimer();

  /* Pause on hover */
  const trackWrap = track.closest('.reviews-track-wrap');
  if (trackWrap) {
    trackWrap.addEventListener('mouseenter', () => clearInterval(slideTimer));
    trackWrap.addEventListener('mouseleave', startTimer);
  }

  /* Touch / swipe support */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToSlide((currentSlide + 1) % cards.length)
               : goToSlide((currentSlide - 1 + cards.length) % cards.length);
    }
    resetTimer();
  });

  /* Recalculate on resize */
  window.addEventListener('resize', () => goToSlide(currentSlide));
}

