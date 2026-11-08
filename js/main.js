/* Campus Events landing page. No libraries, no network requests.
   Opening sequence timings (seconds after load) come from a frame-by-frame measurement of the reference:
   bar fills 0.08-1.7, folds into the mark 1.92-2.32, mark opens onto the page 2.68-3.2,
   header buttons rise 3.76, headline words 3.92, scroll cue and calls to action ~4.05. */
(function () {
  'use strict';
  window.__cemReady = true;   /* tells the failsafe timer in index.html that this script is running */

  var root = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intro = !root.classList.contains('no-intro');
  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var inOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  var yr = $('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- split text into words (each word sits in a mask so it can rise into view) ---------- */
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/\s+/).forEach(function (t, i, all) {
      var w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.textContent = t;
      w.appendChild(inner);
      el.appendChild(w);
      if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- header: solid background once the page has moved ---------- */
  var bar = $('bar');
  function onBar() { bar.classList.toggle('is-solid', window.scrollY > 40); }

  /* ---------- menu ---------- */
  var menu = $('menu'), btn = $('menuBtn');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    body.classList.toggle('is-locked', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (open) {
      var first = menu.querySelector('a');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
    } else {
      btn.focus({ preventScroll: true });
    }
  }
  btn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
  });

  /* ---------- statement that lights up word by word while you scroll ---------- */
  var scrub = document.querySelector('[data-scrub]');
  var words = [];
  if (scrub) {
    var parts = scrub.textContent.trim().split(/\s+/);
    scrub.setAttribute('aria-label', parts.join(' '));
    scrub.textContent = '';
    parts.forEach(function (t) {
      var s = document.createElement('span');
      s.className = 'w';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = t;
      scrub.appendChild(s);
      words.push(s);
    });
  }
  var scrubWrap = scrub ? scrub.closest('.scrub') : null;
  var lastOn = -1;
  function onScrub() {
    if (!scrubWrap || reduce) return;
    var r = scrubWrap.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? clamp(-r.top / span, 0, 1) : 1;
    var on = Math.round(p * 1.15 * words.length);
    if (on === lastOn) return;
    lastOn = on;
    for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < on);
  }
  if (reduce) words.forEach(function (w) { w.classList.add('on'); });
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onBar(); onScrub(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', function () { lastOn = -1; onScrub(); });
  onBar(); onScrub();

  /* ---------- intro ---------- */
  var T0 = performance.now();
  var loader = $('loader');
  var finished = false;

  function reveal(el, delay, dur, ease, from) {
    if (!el.animate) return;
    el.animate(
      [{ transform: 'translateY(' + (from || '112%') + ')', opacity: from === '8px' ? 0 : 1 }, { transform: 'none', opacity: 1 }],
      { duration: dur * 1000, delay: delay * 1000, easing: ease, fill: 'both' }
    );
  }

  function scheduleReveals() {
    var OUT = 'cubic-bezier(0.16,1,0.3,1)';
    var WORD = 'cubic-bezier(0.25,0.5,0.1,1)';
    var K = window.innerWidth < 900 ? 1.3 : 1;   /* the reference's reveals run about 30% longer on phones */
    /* header buttons rise out of their masks */
    document.querySelectorAll('.mask-pill > .pill').forEach(function (p, i) {
      reveal(p, 3.67 + i * 0.05, 0.8 * K, WORD, '115%');
    });
    /* headline: lines start at slightly different times, words stagger inside a line */
    var lineStart = [3.82, 3.98, 4.28, 4.34, 4.38, 4.42];
    var title = document.querySelector('.hero__title');
    var lineIdx = -1, prevTop = -1e9, inLine = 0;
    title.querySelectorAll('.w').forEach(function (w) {
      var top = w.getBoundingClientRect().top;
      if (top > prevTop + 8) { lineIdx++; inLine = 0; }
      prevTop = top;
      reveal(w.firstChild, (lineStart[lineIdx] || 4.4) + inLine * 0.045, 0.95 * K, WORD);
      inLine++;
    });
    /* scroll cue and the + marks */
    document.querySelectorAll('.hero__scroll-text .w').forEach(function (w, i) {
      reveal(w.firstChild, 3.94 + i * 0.05, 0.95 * K, WORD);
    });
    document.querySelectorAll('.hero__scroll .cross').forEach(function (c, i) {
      reveal(c, 3.98 + i * 0.04, 0.7, OUT, '8px');
    });
    /* calls to action inside the panel */
    document.querySelectorAll('.hero__cta .pill').forEach(function (p, i) {
      reveal(p, 4.12 + i * 0.08, 0.8, OUT, '130%');
    });
  }

  function finishIntro() {
    if (finished) return;
    finished = true;
    loader.style.display = 'none';
    root.classList.add('no-intro');
    document.getAnimations().forEach(function (a) { try { a.finish(); } catch (e) {} });
    cancelAnimationFrame(introRaf);
  }

  var introRaf = 0;
  if (intro) {
    try { sessionStorage.setItem('cem-intro', '1'); } catch (e) {}
    scheduleReveals();

    var bar_ = $('ldBar'), fill = $('ldFill'), mark = $('ldMark'), count = $('ldCount'), veil = $('ldVeil');
    var pieces = mark.querySelectorAll('i');
    var W = 0, H = 0, u = 12, sEnd = 20;
    var NS = 'http://www.w3.org/2000/svg';

    /* the mark, in units of the bar's thickness: a stem and three arms */
    var FROM = [[-2.5, -0.5, 1.25, 1], [-1.25, -0.5, 1.25, 1], [0, -0.5, 1.25, 1], [1.25, -0.5, 1.25, 1]];
    var TO = [[-1.5, -2, 1, 4], [-0.5, -2, 2, 1], [-0.5, -0.5, 2, 1], [-0.5, 1, 2, 1]];
    var hole = $('ldHole'), fillE = $('ldFillE');
    [hole, fillE].forEach(function (g) {
      TO.forEach(function () { g.appendChild(document.createElementNS(NS, 'rect')); });
    });
    /* measured every frame, because the window can still be settling when the page first runs */
    function layout() {
      var w = window.innerWidth, h = window.innerHeight, nu = Math.max(12.8, 0.0292 * w);
      if (w === W && h === H && nu === u) return;
      W = w; H = h; u = nu; sEnd = 1.05 * H / u;
      veil.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      ['ldMaskBg', 'ldBlack'].forEach(function (id) { $(id).setAttribute('width', W); $(id).setAttribute('height', H); });
      var m = $('ldMask'); m.setAttribute('x', 0); m.setAttribute('y', 0); m.setAttribute('width', W); m.setAttribute('height', H);
      [hole, fillE].forEach(function (g) {
        var rs = g.children;
        for (var i = 0; i < TO.length; i++) {
          rs[i].setAttribute('x', TO[i][0] * u); rs[i].setAttribute('y', TO[i][1] * u);
          rs[i].setAttribute('width', TO[i][2] * u); rs[i].setAttribute('height', TO[i][3] * u);
        }
      });
    }
    veil.setAttribute('preserveAspectRatio', 'none');

    var P = [[0, 0], [0.075, 0], [0.4, 0.286], [0.8, 0.648], [1.04, 0.862], [1.2, 0.895], [1.44, 0.948], [1.68, 1]];
    function prog(t) {
      if (t >= 1.68) return 1;
      for (var i = 1; i < P.length; i++) if (t <= P[i][0]) return lerp(P[i - 1][1], P[i][1], (t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]));
      return 1;
    }
    /* growth of the opening, as a fraction of the way to filling the screen (measured) */
    var G = [[0, 0], [0.077, 0.006], [0.23, 0.034], [0.38, 0.084], [0.54, 0.222], [0.69, 0.453], [0.85, 0.707], [1, 1]];
    function growth(x) {
      for (var i = 1; i < G.length; i++) if (x <= G[i][0]) return lerp(G[i - 1][1], G[i][1], (x - G[i - 1][0]) / (G[i][0] - G[i - 1][0]));
      return 1;
    }

    var swapped = false;
    function frame() {
      layout();
      var t = (performance.now() - T0) / 1000;
      var p = prog(t);
      fill.style.transform = 'scaleX(' + p + ')';
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');

      if (t >= 1.68 && t < 2.68) {
        bar_.style.display = 'none';
        mark.style.opacity = 1;
        pieces.forEach(function (el, i) {
          var f = inOut(clamp((t - 1.92 - i * 0.03) / 0.4, 0, 1));
          var a = FROM[i], b = TO[i];
          el.style.left = lerp(a[0], b[0], f) * u + 'px';
          el.style.top = lerp(a[1], b[1], f) * u + 'px';
          el.style.width = lerp(a[2], b[2], f) * u + 'px';
          el.style.height = lerp(a[3], b[3], f) * u + 'px';
        });
      }
      if (t >= 2.68) {
        if (!swapped) {
          swapped = true;
          mark.style.display = 'none';
          loader.style.background = 'transparent';
          veil.style.display = 'block';
        }
        var s = Math.exp(Math.log(sEnd) * growth(clamp((t - 2.68) / 0.52, 0, 1)));
        var tr = 'translate(' + W / 2 + ' ' + H / 2 + ') scale(' + s + ')';
        hole.setAttribute('transform', tr);
        fillE.setAttribute('transform', tr);
        fillE.setAttribute('opacity', clamp(1 - (t - 2.9) / 0.24, 0, 1));
        count.style.opacity = clamp(1 - (t - 2.7) / 0.3, 0, 1);
      }
      if (t >= 3.3) { finishIntro(); return; }
      introRaf = requestAnimationFrame(frame);
    }
    introRaf = requestAnimationFrame(frame);
    loader.addEventListener('click', finishIntro);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') finishIntro(); });
  }

  /* ---------- hero panel: glossy balls that float and shift with the pointer, like a slow camera drift ---------- */
  var canvas = $('heroCanvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var panel = $('heroVisual');
  var cw = 0, ch = 0, dpr = 1, balls = [], raf = 0, inView = true, lastW = 0;
  var mouse = { x: 0, y: 0, sx: 0, sy: 0 };

  /* [highlight, body, shade] */
  var COLORS = {
    indigo: ['#9a90ff', '#5948F5', '#2a1f9e'],
    white:  ['#ffffff', '#dfe1ee', '#8d92aa'],
    slate:  ['#6a6f86', '#2B2E3A', '#0c0d12'],
    amber:  ['#ffe7b3', '#FFB547', '#b86f12'],
    mint:   ['#c5f7e8', '#35C9A5', '#146a58']
  };
  var MIX = ['indigo', 'white', 'slate', 'indigo', 'white', 'slate', 'indigo', 'white', 'amber', 'mint', 'slate', 'indigo'];
  function rnd(seed) { var x = Math.sin(seed * 127.1) * 43758.5453; return x - Math.floor(x); }

  function build() {
    var r = panel.getBoundingClientRect();
    cw = Math.max(1, Math.round(r.width)); ch = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = cw < 640 ? 15 : 24, base = Math.min(cw, ch * 1.2);
    balls = [];
    for (var i = 0; i < n; i++) {
      var z = 0.35 + rnd(i + 3) * 0.65;               /* depth: 1 is closest */
      balls.push({
        bx: rnd(i + 11) * cw, by: rnd(i + 29) * ch,
        r: (0.07 + rnd(i + 47) * 0.1) * base * (0.55 + z * 0.75),
        z: z, ph: rnd(i + 71) * 6.28, sp: 0.5 + rnd(i + 91) * 0.7, amp: 14 + rnd(i + 5) * 30,
        c: COLORS[MIX[i % MIX.length]]
      });
    }
    balls.sort(function (a, b) { return a.z - b.z; });
  }

  function draw(t) {
    ctx.clearRect(0, 0, cw, ch);
    mouse.sx += (mouse.x - mouse.sx) * 0.06; mouse.sy += (mouse.y - mouse.sy) * 0.06;
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      var x = b.bx + Math.sin(t * 0.00035 * b.sp + b.ph) * b.amp - mouse.sx * 46 * b.z + Math.sin(t * 0.0001 + b.ph) * 20;
      var y = b.by + Math.cos(t * 0.0003 * b.sp + b.ph * 1.3) * b.amp - mouse.sy * 32 * b.z;
      var r = b.r * (1 + Math.sin(t * 0.0004 + b.ph) * 0.02);
      var g = ctx.createRadialGradient(x - r * 0.36, y - r * 0.4, r * 0.05, x, y, r);
      g.addColorStop(0, b.c[0]); g.addColorStop(0.55, b.c[1]); g.addColorStop(1, b.c[2]);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      /* specular glint */
      var s = ctx.createRadialGradient(x - r * 0.42, y - r * 0.46, 0, x - r * 0.42, y - r * 0.46, r * 0.3);
      s.addColorStop(0, 'rgba(255,255,255,0.65)'); s.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = s;
      ctx.beginPath(); ctx.arc(x - r * 0.42, y - r * 0.46, r * 0.3, 0, 6.2832); ctx.fill();
    }
  }
  function loop(now) {
    draw(now);
    raf = inView && !document.hidden ? requestAnimationFrame(loop) : 0;
  }
  function start() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  build(); lastW = cw;
  if (reduce) draw(4000); else start();

  panel.addEventListener('pointermove', function (e) {
    var r = panel.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width - 0.5; mouse.y = (e.clientY - r.top) / r.height - 0.5;
  }, { passive: true });
  panel.addEventListener('pointerleave', function () { mouse.x = 0; mouse.y = 0; });

  window.addEventListener('resize', function () {
    var w = Math.round(panel.getBoundingClientRect().width);
    if (w !== lastW) { lastW = w; build(); if (reduce) draw(4000); }
    else { var h = Math.round(panel.getBoundingClientRect().height); if (h !== ch) { build(); if (reduce) draw(4000); } }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (inView) start(); }, { threshold: 0 }).observe(panel);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
})();
