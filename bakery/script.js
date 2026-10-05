const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches; // hover-to-open panels

// ---------- loader (counts to 100) ----------
(function () {
  const n = $('#loadNum'), t0 = performance.now(), dur = 1500;
  (function tick(t) {
    const p = clamp((t - t0) / dur);
    n.textContent = Math.round(p * 100);
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(() => $('#loader').classList.add('done'), 250);
  })(t0);
})();

// ---------- hero title: split into letters ----------
$$('.hl').forEach((el, li) => {
  el.innerHTML = [...el.dataset.t].map((c, i) =>
    `<span class="ch" style="animation-delay:${1.9 + li * .18 + i * .045}s">${c}</span>`).join('');
});

// ---------- hero slideshow ----------
const sbg = $$('.sbg'), hdots = $$('#heroDots button');
let hs = 0, hTimer;
function heroGo(i) {
  hs = i;
  sbg.forEach((s, k) => s.classList.toggle('active', k === i));
  hdots.forEach((d, k) => { d.classList.remove('active'); if (k === i) { void d.offsetWidth; d.classList.add('active'); } });
}
function heroAuto() { clearInterval(hTimer); hTimer = setInterval(() => heroGo((hs + 1) % sbg.length), 5000); }
hdots.forEach((d, i) => d.onclick = () => { heroGo(i); heroAuto(); });
heroAuto();

// ---------- typed rotating word ----------
const words = ['butter', 'warmth', 'craft', 'tradition', 'joy'];
let wi = 0, ci = words[0].length, del = true;
const rot = $('#rot');
(function type() {
  rot.textContent = words[wi].slice(0, ci);
  if (del) { ci--; if (ci < 0) { del = false; wi = (wi + 1) % words.length; ci = 0; } }
  else { ci++; if (ci > words[wi].length) { del = true; ci = words[wi].length; return setTimeout(type, 1400); } }
  setTimeout(type, del ? 45 : 90);
})();

// ---------- floating flour dust (pauses offscreen) ----------
(function () {
  const cv = $('#embers'), cx = cv.getContext('2d'), hero = $('#home');
  let W, H, run = true; const ps = [];
  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  resize(); addEventListener('resize', resize);
  const mk = rand => ({ x: Math.random() * W, y: rand ? Math.random() * H : -10, r: Math.random() * 1.8 + .8, v: Math.random() * .6 + .2,
    dx: (Math.random() - .5) * .6, c: Math.random() < .7 ? '255,244,225' : '242,165,72', a: Math.random() * .5 + .25 });
  for (let i = 0; i < 40; i++) ps.push(mk(true));
  new IntersectionObserver(e => { run = e[0].isIntersecting; if (run) frame(); }).observe(hero);
  function frame() {
    if (!run) return;
    cx.clearRect(0, 0, W, H);
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.y += p.v; p.x += p.dx + Math.sin(p.y / 40) * .25; p.a -= .0008;
      cx.fillStyle = `rgba(${p.c},${Math.max(p.a, 0)})`;
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      if (p.y > H + 10 || p.a <= 0) ps[i] = mk(false);
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// ---------- scroll (one rAF-throttled handler, cached sizes) ----------
const nav = $('#nav'), totop = $('#totop'), prog = $('#progress'), marq = $('.marq');
let lastY = scrollY, skew = 0, ticking = false, maxScroll = 1;
const calc = () => { maxScroll = document.documentElement.scrollHeight - innerHeight; };
addEventListener('load', calc); addEventListener('resize', calc);
let navS = false, topS = false;
function onScroll() {
  const y = scrollY;
  prog.style.transform = `scaleX(${y / maxScroll})`;
  const n = y > 40, t = y > 700;
  if (n !== navS) { navS = n; nav.classList.toggle('scrolled', n); }
  if (t !== topS) { topS = t; totop.classList.toggle('show', t); }
  skew += (clamp((y - lastY) * .12, -4, 4) - skew) * .5; lastY = y;
  marq.style.transform = Math.abs(skew) > .05 ? `skewY(${skew.toFixed(2)}deg)` : '';
  statement(); hscroll();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
setInterval(() => { if (Math.abs(skew) > .05) { skew *= .6; marq.style.transform = Math.abs(skew) > .05 ? `skewY(${skew.toFixed(2)}deg)` : ''; } }, 80);
totop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// mobile menu
const burger = $('#burger'), menu = $('#menu');
burger.onclick = () => { burger.classList.toggle('open'); menu.classList.toggle('open'); };
$$('#menu a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

// ---------- pinned statement: words light up on scroll ----------
const wEl = $('#words'), hot = /^(mornings|slow|real|hand|every|butter)/i;
wEl.innerHTML = wEl.textContent.split(' ').map(w => `<span class="w${hot.test(w) ? ' hot' : ''}">${w}</span>`).join(' ');
const wSpans = $$('.w', wEl), sec = $('#statement');
let lastN = -1;
function statement() {
  const r = sec.getBoundingClientRect();
  if (r.bottom < -100 || r.top > innerHeight + 100) return;
  const n = Math.round(clamp(-r.top / (r.height - innerHeight)) * 1.15 * wSpans.length);
  if (n === lastN) return; lastN = n;
  wSpans.forEach((s, i) => s.classList.toggle('on', i < n));
}

// ---------- menu accordion ----------
const panels = $$('.panel');
panels.forEach(p => {
  const open = () => { panels.forEach(x => x.classList.remove('active')); p.classList.add('active'); };
  p.addEventListener('click', open);
  if (fine) p.addEventListener('mouseenter', open);
});

// ---------- horizontal scroll gallery ----------
const hs0 = $('#gallery'), htrack = $('#htrack'), hstick = $('.hstick'), htitle = $('.htitle');
let trackW = 0;
function hsize() {
  trackW = htrack.scrollWidth - innerWidth;
  hs0.style.height = (trackW + innerHeight) + 'px';
  calc();
}
addEventListener('resize', hsize); addEventListener('load', hsize); hsize();
let lastP = -1;
function hscroll() {
  const h = hs0.offsetHeight - innerHeight, p = clamp((scrollY - hs0.offsetTop) / h);
  if (p === lastP) return; lastP = p;
  htrack.style.transform = `translate3d(${-p * trackW}px,0,0)`;
  hstick.style.setProperty('--p', p);
  htitle.style.opacity = 1 - clamp(p * 5);
}

// ---------- reveal / counters / magnetic ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
$$('.reveal').forEach(el => io.observe(el));

const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 2000;
  const tick = t => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick); cio.unobserve(el);
}), { threshold: .6 });
$$('[data-count]').forEach(el => cio.observe(el));

$$('.magnetic').forEach(b => {
  b.addEventListener('mousemove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
  b.addEventListener('mouseleave', () => b.style.transform = '');
});

// ripple on click
addEventListener('click', e => {
  const r = document.createElement('span'); r.className = 'ripple';
  r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
  document.body.appendChild(r); setTimeout(() => r.remove(), 700);
});

// ---------- bake schedule ----------
const data = {
  mon: [['05:30', 'Country Sourdough', 'Elena Rossi', 'Bread'], ['07:00', 'Butter Croissants', 'Julien Marchand', 'Pastry'], ['11:00', 'Seeded Rye', 'Elena Rossi', 'Bread'], ['15:00', 'Chocolate Chunk Cookies', 'Sam O\'Brien', 'Cookies']],
  tue: [['05:30', 'Baguettes', 'Elena Rossi', 'Bread'], ['07:00', 'Pain au Chocolat', 'Julien Marchand', 'Pastry'], ['10:30', 'Lemon Raspberry Cake', 'Maya Patel', 'Cakes'], ['15:30', 'Fruit Tarts', 'Maya Patel', 'Tarts']],
  wed: [['05:30', 'Olive & Rosemary Focaccia', 'Elena Rossi', 'Bread'], ['07:00', 'Almond Croissants', 'Julien Marchand', 'Pastry'], ['12:00', 'Cinnamon Rolls', 'Julien Marchand', 'Pastry'], ['15:00', 'Oat & Raisin Cookies', 'Sam O\'Brien', 'Cookies']],
  thu: [['05:30', 'Country Sourdough', 'Elena Rossi', 'Bread'], ['07:00', 'Butter Croissants', 'Julien Marchand', 'Pastry'], ['11:00', 'Red Velvet Cake', 'Maya Patel', 'Cakes'], ['16:00', 'Brown Butter Cookies', 'Sam O\'Brien', 'Cookies']],
  fri: [['05:30', 'Challah', 'Elena Rossi', 'Bread'], ['07:00', 'Ham & Gruyère Croissants', 'Julien Marchand', 'Pastry'], ['11:30', 'Chocolate Drip Cake', 'Maya Patel', 'Cakes'], ['16:30', 'Weekend Cookie Boxes', 'Sam O\'Brien', 'Cookies']],
  sat: [['05:00', 'Full Bread Wall', 'Elena Rossi', 'Bread'], ['07:00', 'Croissant Marathon', 'Julien Marchand', 'Pastry'], ['10:00', 'Pistachio Rose Cake', 'Maya Patel', 'Cakes'], ['13:00', 'Seasonal Pies', 'Maya Patel', 'Pies']],
  sun: [['06:00', 'Sunday Sourdough', 'Elena Rossi', 'Bread'], ['08:00', 'Brunch Pastries', 'Julien Marchand', 'Pastry'], ['11:00', 'Cinnamon Buns', 'Sam O\'Brien', 'Pastry']]
};
const sched = $('#sched');
function renderDay(d) {
  sched.innerHTML = data[d].map((r, i) =>
    `<div class="row" style="animation-delay:${i * .09}s"><time>${r[0]}</time><div><h4>${r[1]}</h4><span>baked by ${r[2]}</span></div><em>${r[3]}</em></div>`).join('');
}
const today = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
renderDay(today);
$$('#tabs button').forEach(b => {
  b.classList.toggle('active', b.dataset.day === today);
  b.onclick = () => {
    $$('#tabs button').forEach(x => x.classList.remove('active')); b.classList.add('active'); renderDay(b.dataset.day);
  };
});

// ---------- pricing toggle ----------
const sw = $('#billing');
sw.onclick = () => {
  sw.classList.toggle('on');
  const y = sw.classList.contains('on');
  $$('.amt b').forEach(b => {
    const from = +b.textContent, to = +b.dataset[y ? 'y' : 'm'], t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / 500, 1); b.textContent = Math.round(from + (to - from) * p); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
};

// ---------- testimonials ----------
const slides = $$('.slide'), dots = $$('#dots button');
let cur = 0, timer;
function show(i) {
  cur = i;
  slides.forEach((s, k) => s.classList.toggle('active', k === i));
  dots.forEach((d, k) => d.classList.toggle('active', k === i));
}
function auto() { clearInterval(timer); timer = setInterval(() => show((cur + 1) % slides.length), 5500); }
dots.forEach((d, i) => d.onclick = () => { show(i); auto(); });
auto();

// ---------- cake estimator ----------
const priceEl = $('#price');
function estimate() {
  const [base, serves] = $('#size').value.split('|').map(Number);
  const tiers = +$('#tiers').value;
  const total = Math.round(base * tiers + +$('#flavor').value + +$('#finish').value);
  const feeds = Math.round(serves * tiers);
  priceEl.textContent = '$' + total;
  priceEl.classList.add('pop'); setTimeout(() => priceEl.classList.remove('pop'), 250);
  $('#calcText').textContent = `Serves about ${feeds} · ready with ${tiers > 1 ? 72 : 48} hours' notice.`;
}
$$('#cakeForm select').forEach(s => s.addEventListener('change', estimate));
$('#cakeForm').addEventListener('submit', e => e.preventDefault());
$('#orderCake').addEventListener('click', () => { $('#interest').value = 'Custom cake'; });

// ---------- contact form ----------
$('#form').addEventListener('submit', e => { e.preventDefault(); $('#ok').classList.add('show'); e.target.reset(); });

onScroll();
