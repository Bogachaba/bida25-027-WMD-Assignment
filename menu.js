/* ═══════════════════════════════════════════════
   CAFE DE LA PARIS — menu.js
   ═══════════════════════════════════════════════ */

'use strict';

/* ══════════ CUSTOM CURSOR ══════════ */
(function initCursor() {
  const dot    = document.getElementById('cursorDot');
  const circle = document.getElementById('cursorCircle');
  if (!dot || !circle) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateCircle() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    circle.style.left = rx + 'px';
    circle.style.top  = ry + 'px';
    requestAnimationFrame(animateCircle);
  })();

  const targets = 'a, button, .menu-card, .tab-btn, .drink-item';
  document.addEventListener('mouseover', e => {
    if (e.target.matches(targets) || e.target.closest(targets)) {
      dot.classList.add('hover');
      circle.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches(targets) || e.target.closest(targets)) {
      dot.classList.remove('hover');
      circle.classList.remove('hover');
    }
  });
})();

/* ══════════ NAV SCROLL + BURGER ══════════ */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    drawer.classList.toggle('open');
  });

  // Close drawer when link is clicked
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
    });
  });
})();

/* ══════════ HERO SLIDER ══════════ */
(function initSlider() {
  const slides    = document.querySelectorAll('.slide');
  const dots      = document.querySelectorAll('.dot');
  const prevBtn   = document.getElementById('prevSlide');
  const nextBtn   = document.getElementById('nextSlide');
  const progress  = document.getElementById('progressFill');

  const DURATION  = 5500; // ms per slide
  let current     = 0;
  let timer       = null;
  let startTime   = null;
  let rafId       = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current].classList.add('active');

    resetProgress();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* Animated progress bar */
  function resetProgress() {
    if (rafId) cancelAnimationFrame(rafId);
    startTime = null;

    if (progress) {
      progress.style.transition = 'none';
      progress.style.width = '0%';
    }

    clearTimeout(timer);

    function step(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);

      if (progress) progress.style.width = pct + '%';

      if (elapsed < DURATION) {
        rafId = requestAnimationFrame(step);
      } else {
        next();
      }
    }
    rafId = requestAnimationFrame(step);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.dot, 10));
    });
  });

  /* Touch swipe */
  let touchStartX = 0;
  const slider = document.getElementById('heroSlider');
  if (slider) {
    slider.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    }, { passive: true });
  }

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  /* Pause on hover */
  if (slider) {
    slider.addEventListener('mouseenter', () => {
      cancelAnimationFrame(rafId);
      rafId = null;
    });
    slider.addEventListener('mouseleave', () => {
      resetProgress();
    });
  }

  /* Init */
  goTo(0);
})();

/* ══════════ MENU TABS ══════════ */
(function initTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const sections  = document.querySelectorAll('.menu-section');
  const tabsWrap  = document.getElementById('menuTabsWrap');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Update buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update sections
      sections.forEach(s => {
        s.classList.remove('active');
        if (s.id === 'tab-' + target) s.classList.add('active');
      });

      // Scroll tab into view (horizontal)
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      // Scroll page to just below tabs
      if (tabsWrap) {
        const offset = tabsWrap.getBoundingClientRect().bottom + window.scrollY;
        window.scrollTo({ top: offset - 10, behavior: 'smooth' });
      }

      // Trigger reveal for newly visible section
      triggerReveal();
    });
  });
})();

/* ══════════ SCROLL REVEAL ══════════ */
function triggerReveal() {
  const items = document.querySelectorAll('.reveal:not(.visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -50px 0px' });

  items.forEach(el => io.observe(el));
}

// Initial reveal on load
document.addEventListener('DOMContentLoaded', () => {
  // Stagger cards within each grid
  document.querySelectorAll('.menu-grid, .drinks-grid').forEach(grid => {
    grid.querySelectorAll('.menu-card, .drinks-col').forEach((el, i) => {
      if (!el.dataset.delay) el.dataset.delay = i * 70;
    });
  });

  triggerReveal();
});

// Also re-trigger on scroll (for elements already in view on load)
window.addEventListener('scroll', triggerReveal, { passive: true });

/* ══════════ STICKY TABS — active highlight on scroll ══════════ */
(function initStickyHighlight() {
  // Only needed if user scrolls manually through sections (not tab-clicked)
  // This watches which section is most in view and highlights its tab
  const sections = document.querySelectorAll('.menu-section');
  const tabBtns  = document.querySelectorAll('.tab-btn');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
        const id = entry.target.id.replace('tab-', '');
        tabBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.tab === id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();

/* ══════════ SMOOTH SCROLL for anchor links ══════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});