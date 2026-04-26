/* ═══════════════════════════════════════════
   CAFÉ DE LA PARIX — contact-script.js
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. Custom cursor */
  const cursor = document.getElementById('cursor');
  const aura   = document.getElementById('aura');
  let mx = 0, my = 0, ax = 0, ay = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });
  (function tick() {
    ax += (mx - ax) * 0.1;
    ay += (my - ay) * 0.1;
    aura.style.left = ax + 'px';
    aura.style.top  = ay + 'px';
    requestAnimationFrame(tick);
  })();
  document.querySelectorAll('a, button, input, textarea, select, .contact-list a').forEach(el => {
    el.addEventListener('mouseenter', () => aura.classList.add('big'));
    el.addEventListener('mouseleave', () => aura.classList.remove('big'));
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity='0'; aura.style.opacity='0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity='1'; aura.style.opacity='1'; });


  /* 2. Navbar stick */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('stuck', window.scrollY > 60), { passive: true });


  /* 3. Mobile nav */
  const burger   = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const mnBackdrop= document.getElementById('mnBackdrop');

  burger.addEventListener('click', () => {
    mobileNav.classList.add('open');
    mnBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
  window.closeMN = () => {
    mobileNav.classList.remove('open');
    mnBackdrop.classList.remove('show');
    document.body.style.overflow = '';
  };
  document.getElementById('mnClose').addEventListener('click', closeMN);


  /* 4. Scroll reveal */
  const rvEls = document.querySelectorAll('.rv');
  const rvObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll('.rv')];
      const i = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('in'), i * 90);
      rvObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  rvEls.forEach(el => rvObs.observe(el));


  /* 5. Char counter for textarea */
  const textarea  = document.getElementById('message');
  const charCount = document.getElementById('charCount');
  const MAX_CHARS = 500;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    if (len > MAX_CHARS) textarea.value = textarea.value.slice(0, MAX_CHARS);
    charCount.textContent = `${Math.min(len, MAX_CHARS)} / ${MAX_CHARS}`;
    charCount.style.color = len >= MAX_CHARS ? '#e06c5a' : '';
  });


  /* 6. Form submit (demo — no real backend) */
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const toast     = document.getElementById('toast');

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      // Shake invalid fields
      form.querySelectorAll(':invalid').forEach(field => {
        field.style.borderColor = '#e06c5a';
        field.addEventListener('input', () => field.style.borderColor = '', { once: true });
        field.closest('.field')?.animate([
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(0)' }
        ], { duration: 280, easing: 'ease' });
      });
      return;
    }

    // Simulate sending
    const origText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Sending…';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = origText;
      form.reset();
      charCount.textContent = '0 / 500';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 5000);
    }, 1400);
  });


  /* 7. Floating leaf parallax on scroll */
  const leaves = document.querySelectorAll('.leaf');
  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    leaves.forEach((leaf, i) => {
      const speed = 0.04 + i * 0.018;
      leaf.style.transform = `${leaf.style.transform.replace(/translateY\([^)]*\)/,'') || ''} translateY(${s * speed}px)`;
    });
  }, { passive: true });


  /* 8. Input floating label feel — add filled class */
  document.querySelectorAll('.field input, .field textarea').forEach(el => {
    el.addEventListener('blur', () => {
      el.closest('.field').classList.toggle('filled', el.value.trim() !== '');
    });
  });

});