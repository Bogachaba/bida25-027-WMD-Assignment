/* ═══════════════════════════════════════════════════
   CAFÉ DE LA PARIX — reservation-script.js
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. CANDLE CANVAS EFFECT ─────────────────── */
  const canvas = document.getElementById('candleCanvas');
  const ctx    = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Particle class for flame sparks
  class Spark {
    constructor(x, y) {
      this.reset(x, y);
    }
    reset(x, y) {
      this.x   = x + (Math.random() - 0.5) * 6;
      this.y   = y;
      this.vx  = (Math.random() - 0.5) * 0.6;
      this.vy  = -(Math.random() * 1.2 + 0.4);
      this.life = 1;
      this.decay = Math.random() * 0.012 + 0.008;
      this.size  = Math.random() * 2.5 + 0.5;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life * 0.6;
      ctx.fillStyle = `rgba(255, ${Math.floor(140 + this.life * 80)}, 40, ${this.life})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Multiple candles across the screen
  const candles = [
    { x: 0.08, y: 0.7 }, { x: 0.18, y: 0.85 },
    { x: 0.92, y: 0.65 },{ x: 0.82, y: 0.8 },
    { x: 0.5,  y: 0.9 }, { x: 0.35, y: 0.88 },
    { x: 0.65, y: 0.82 }
  ];
  const sparks = [];

  candles.forEach(c => {
    for (let i = 0; i < 12; i++) {
      sparks.push(new Spark(c.x * window.innerWidth, c.y * window.innerHeight));
    }
  });

  let frame = 0;
  function animateCandles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Warm ambient glow
    candles.forEach(c => {
      const cx = c.x * canvas.width;
      const cy = c.y * canvas.height;
      const flicker = Math.sin(frame * 0.07 + c.x * 10) * 0.08 + 0.92;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180 * flicker);
      grad.addColorStop(0,   'rgba(200, 120, 20, 0.18)');
      grad.addColorStop(0.5, 'rgba(160, 80, 10, 0.07)');
      grad.addColorStop(1,   'rgba(100, 40, 5, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Sparks
    sparks.forEach((s, i) => {
      s.update();
      s.draw();
      if (s.life <= 0) {
        const c = candles[Math.floor(i / 12) % candles.length];
        s.reset(c.x * canvas.width, c.y * canvas.height - 10);
      }
    });

    // Add new sparks occasionally
    if (frame % 4 === 0) {
      const c = candles[Math.floor(Math.random() * candles.length)];
      sparks.push(new Spark(c.x * canvas.width, c.y * canvas.height - 10));
      if (sparks.length > 200) sparks.shift();
    }

    frame++;
    requestAnimationFrame(animateCandles);
  }
  animateCandles();


  /* ─── 2. CUSTOM CURSOR ────────────────────────── */
  const dot  = document.getElementById('dot');
  const ring = document.getElementById('dotRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function tick() {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  })();
  document.querySelectorAll('a, button, input, textarea, select, .seat-opt, .checkbox-label').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('expand'));
    el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });


  /* ─── 3. NAVBAR ───────────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('stuck', window.scrollY > 60), { passive: true });

  const hbg = document.getElementById('hbg');
  const drawer  = document.getElementById('drawer');
  const drBd    = document.getElementById('drBd');

  hbg.addEventListener('click', () => { drawer.classList.add('open'); drBd.classList.add('show'); document.body.style.overflow='hidden'; });
  window.closeDr = () => { drawer.classList.remove('open'); drBd.classList.remove('show'); document.body.style.overflow=''; };
  document.getElementById('drX').addEventListener('click', closeDr);


  /* ─── 4. SCROLL REVEAL ────────────────────────── */
  const rvEls = document.querySelectorAll('.rv');
  const rvObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll('.rv')];
      setTimeout(() => entry.target.classList.add('in'), siblings.indexOf(entry.target) * 80);
      rvObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  rvEls.forEach(el => rvObs.observe(el));


  /* ─── 5. GUEST PICKER ─────────────────────────── */
  let guestCount = 2;
  const guestDisplay = document.getElementById('guestCount');
  const guestInput   = document.getElementById('rGuests');

  document.getElementById('guestMinus').addEventListener('click', () => {
    if (guestCount > 1) {
      guestCount--;
      guestDisplay.textContent = guestCount;
      guestInput.value = guestCount;
      animateGuestCount();
    }
  });
  document.getElementById('guestPlus').addEventListener('click', () => {
    if (guestCount < 20) {
      guestCount++;
      guestDisplay.textContent = guestCount;
      guestInput.value = guestCount;
      animateGuestCount();
    }
  });
  function animateGuestCount() {
    guestDisplay.animate([
      { transform: 'scale(1.4)', color: '#e8aa52' },
      { transform: 'scale(1)',   color: '#f0e2c4' }
    ], { duration: 280, easing: 'ease' });
  }


  /* ─── 6. SET MIN DATE (today) ─────────────────── */
  const dateInput = document.getElementById('rDate');
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;


  /* ─── 7. MULTI-STEP FORM ──────────────────────── */
  const form1 = document.getElementById('step1');
  const form2 = document.getElementById('step2');
  const form3 = document.getElementById('step3');
  const steps = document.querySelectorAll('.step');
  const successScreen = document.getElementById('successScreen');
  const resForm       = document.getElementById('resForm');

  function setStep(n) {
    [form1, form2, form3].forEach((f, i) => {
      f.classList.toggle('active', i + 1 === n);
    });
    steps.forEach((s, i) => {
      s.classList.toggle('active', i + 1 === n);
      s.classList.toggle('done',   i + 1 < n);
    });
    window.scrollTo({ top: document.getElementById('form').offsetTop - 100, behavior: 'smooth' });
  }

  function validateStep1() {
    const fn = document.getElementById('rFirstName').value.trim();
    const ln = document.getElementById('rLastName').value.trim();
    const em = document.getElementById('rEmail').value.trim();
    const ph = document.getElementById('rPhone').value.trim();
    if (!fn || !ln || !em || !ph) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return false;
    return true;
  }
  function validateStep2() {
    const dt = document.getElementById('rDate').value;
    const tm = document.getElementById('rTime').value;
    return dt && tm;
  }

  document.getElementById('toStep2').addEventListener('click', () => {
    if (!validateStep1()) { shakeInvalid(form1); return; }
    setStep(2);
  });
  document.getElementById('toStep1').addEventListener('click', () => setStep(1));

  document.getElementById('toStep3').addEventListener('click', () => {
    if (!validateStep2()) { shakeInvalid(form2); return; }
    buildSummary();
    setStep(3);
  });
  document.getElementById('toStep2b').addEventListener('click', () => setStep(2));

  function shakeInvalid(stepEl) {
    stepEl.animate([
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(0)' }
    ], { duration: 320, easing: 'ease' });
    // Highlight empty fields
    stepEl.querySelectorAll('input:required, select:required').forEach(el => {
      if (!el.value) {
        el.style.borderColor = '#c85a3a';
        el.addEventListener('input', () => el.style.borderColor = '', { once: true });
      }
    });
  }

  function buildSummary() {
    const fn  = document.getElementById('rFirstName').value;
    const ln  = document.getElementById('rLastName').value;
    const em  = document.getElementById('rEmail').value;
    const ph  = document.getElementById('rPhone').value;
    const dt  = document.getElementById('rDate').value;
    const tm  = document.getElementById('rTime').value;
    const oc  = document.getElementById('rOccasion').value || '—';
    const gu  = document.getElementById('rGuests').value;
    const sea = document.querySelector('input[name="seating"]:checked')?.value || 'Indoor';

    const fmt = dt ? new Date(dt + 'T00:00').toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '';

    const rows = [
      ['Name',     `${fn} ${ln}`],
      ['Email',    em],
      ['Phone',    ph],
      ['Date',     fmt],
      ['Time',     tm],
      ['Guests',   `${gu} ${gu == 1 ? 'guest' : 'guests'}`],
      ['Seating',  sea.charAt(0).toUpperCase() + sea.slice(1)],
      ['Occasion', oc],
    ];

    document.getElementById('summaryGrid').innerHTML = rows.map(([k, v]) => `
      <div class="summary-row">
        <span>${k}</span>
        <span>${v}</span>
      </div>
    `).join('');
  }

  resForm.addEventListener('submit', e => {
    e.preventDefault();

    const agree = document.getElementById('rAgree').checked;
    if (!agree) {
      document.querySelector('.checkbox-custom').animate([
        { transform: 'scale(1.3)' }, { transform: 'scale(1)' }
      ], { duration: 240 });
      return;
    }

    const btn = document.getElementById('confirmBtn');
    btn.disabled = true;
    btn.querySelector('.bc-text').textContent = 'Confirming…';

    setTimeout(() => {
      resForm.style.display = 'none';
      document.getElementById('successEmail').textContent = document.getElementById('rEmail').value;
      successScreen.classList.add('show');
    }, 1600);
  });

  window.resetForm = () => {
    resForm.reset();
    guestCount = 2;
    guestDisplay.textContent = '2';
    guestInput.value = '2';
    resForm.style.display = 'block';
    successScreen.classList.remove('show');
    const btn = document.getElementById('confirmBtn');
    btn.disabled = false;
    btn.querySelector('.bc-text').textContent = 'Confirm Reservation';
    setStep(1);
  };


  /* ─── 8. DECO FRAME ENTRANCE ──────────────────── */
  document.querySelectorAll('.deco-tl, .deco-tr, .deco-bl, .deco-br').forEach((el, i) => {
    el.style.transition = `opacity 1.2s ease ${0.6 + i * 0.15}s, transform 1.2s ease ${0.6 + i * 0.15}s`;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.6)';
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'scale(1)'; }, 800 + i * 150);
  });

});