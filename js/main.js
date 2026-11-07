/* Campus Events landing page. No libraries, no network requests. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- header: solid background once the page has moved ---------- */
  var bar = document.getElementById('bar');
  function onBar() { bar.classList.toggle('is-solid', window.scrollY > 24); }
  onBar();

  /* ---------- full-screen menu ---------- */
  var menu = document.getElementById('menu');
  var btn = document.getElementById('menuBtn');
  var lastFocus = null;

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    menu.setAttribute('aria-hidden', String(!open));
    if (open) {
      lastFocus = document.activeElement;
      var first = menu.querySelector('a');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
    } else if (lastFocus) {
      btn.focus({ preventScroll: true });
    }
  }
  btn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a) setMenu(false); /* in-page anchors scroll after the menu closes; other links navigate away */
  });
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
    var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
    var on = Math.round(p * 1.15 * words.length); /* finishes a little before the section unpins */
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
  onScrub();

  /* ---------- hero: soft 3D-looking balls that drift, bump into each other and move away from your finger or cursor ---------- */
  var canvas = document.getElementById('heroCanvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.parentElement;
  var W = 0, H = 0, dpr = 1, balls = [], raf = 0, inView = true;
  var pointer = { x: -9999, y: -9999 };

  /* [highlight, base]; the strong indigo is only used on small balls so the hero text stays easy to read */
  var SOFT = [['#ECE9FF', '#A79EFF'], ['#FFF0D2', '#FFC873'], ['#DDF7EF', '#7ADCC2']];
  var STRONG = ['#8F84FF', '#5948F5'];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    var rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var small = W < 640;
    var n = small ? 8 : 14;
    var base = Math.min(W, H);
    balls = [];
    for (var i = 0; i < n; i++) {
      var strong = i % 5 === 4;
      var r = strong ? rand(0.035, 0.055) * base : rand(0.06, small ? 0.13 : 0.12) * base;
      r = Math.max(r, 16);
      var pal = strong ? STRONG : SOFT[i % SOFT.length];
      balls.push({
        x: rand(r, W - r), y: rand(r, H - r), r: r,
        vx: rand(-0.35, 0.35), vy: rand(-0.35, 0.35),
        hi: pal[0], lo: pal[1]
      });
    }
  }

  function step() {
    var i, j, a, b;
    for (i = 0; i < balls.length; i++) {
      a = balls[i];
      /* move away from the pointer */
      var dx = a.x - pointer.x, dy = a.y - pointer.y, d = Math.sqrt(dx * dx + dy * dy), reach = a.r + 130;
      if (d < reach && d > 0.001) {
        var f = (1 - d / reach) * 0.55;
        a.vx += (dx / d) * f; a.vy += (dy / d) * f;
      }
      a.vx *= 0.992; a.vy *= 0.992;
      var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
      if (sp < 0.12) { a.vx += rand(-0.02, 0.02); a.vy += rand(-0.02, 0.02); } /* never come to a full stop */
      if (sp > 3.2) { a.vx *= 3.2 / sp; a.vy *= 3.2 / sp; }
      a.x += a.vx; a.y += a.vy;
      if (a.x < a.r) { a.x = a.r; a.vx = Math.abs(a.vx); }
      if (a.x > W - a.r) { a.x = W - a.r; a.vx = -Math.abs(a.vx); }
      if (a.y < a.r) { a.y = a.r; a.vy = Math.abs(a.vy); }
      if (a.y > H - a.r) { a.y = H - a.r; a.vy = -Math.abs(a.vy); }
    }
    /* ball against ball: push apart and trade velocity along the line between them */
    for (i = 0; i < balls.length; i++) {
      for (j = i + 1; j < balls.length; j++) {
        a = balls[i]; b = balls[j];
        var nx = b.x - a.x, ny = b.y - a.y, dist = Math.sqrt(nx * nx + ny * ny), min = a.r + b.r;
        if (dist < min && dist > 0.001) {
          nx /= dist; ny /= dist;
          var ma = a.r * a.r, mb = b.r * b.r, over = (min - dist) / 2;
          a.x -= nx * over; a.y -= ny * over; b.x += nx * over; b.y += ny * over;
          var rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            var imp = (2 * rv) / (ma + mb);
            a.vx += imp * mb * nx; a.vy += imp * mb * ny;
            b.vx -= imp * ma * nx; b.vy -= imp * ma * ny;
          }
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < balls.length; i++) {
      var a = balls[i];
      /* contact shadow, then a lit sphere */
      ctx.fillStyle = 'rgba(16,23,43,0.06)';
      ctx.beginPath();
      ctx.ellipse(a.x + a.r * 0.08, a.y + a.r * 0.98, a.r * 0.78, a.r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      var g = ctx.createRadialGradient(a.x - a.r * 0.38, a.y - a.r * 0.42, a.r * 0.08, a.x, a.y, a.r);
      g.addColorStop(0, a.hi);
      g.addColorStop(1, a.lo);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    step(); draw();
    raf = inView && !document.hidden ? requestAnimationFrame(loop) : 0;
  }
  function start() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  build();
  if (reduce) {
    for (var k = 0; k < 40; k++) step(); /* settle once, draw a still picture */
    draw();
  } else {
    start();
  }

  window.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
  }, { passive: true });
  window.addEventListener('pointerup', function () { pointer.x = pointer.y = -9999; });
  document.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });

  /* only rebuild when the width changes, so the mobile address bar showing and hiding does not reshuffle the balls */
  var lastW = W;
  window.addEventListener('resize', function () {
    var w = Math.round(hero.getBoundingClientRect().width);
    if (w === lastW) { H = Math.round(hero.getBoundingClientRect().height); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return; }
    lastW = w; build(); if (reduce) { draw(); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (inView) start(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
})();
