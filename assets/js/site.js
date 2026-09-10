/* ==========================================================================
   Isaac Originals site behaviour
   Light streaks, thumb-press highlight, scroll reveal.
   Every mobile lesson from the /connect build is baked in here. See notes.
   ========================================================================== */
(function () {
  'use strict';

  var BUILD = '2026-09-10.1';
  try { console.log('%cIsaac Originals build ' + BUILD, 'color:#2DD4FF'); } catch (e) {}

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH = matchMedia('(hover: none)').matches;

  /* ---------------- LIGHT STREAKS ----------------
     Sparse diagonal trails. Mostly white, some cyan, fewer gold.
     Sleeps when the tab is hidden and idles completely between trails. */
  (function fx() {
    if (REDUCED) return;
    var cv = document.getElementById('fx');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var W, H, dpr, dirty = false;
    var streaks = [];
    var MAX = TOUCH ? 4 : 9;
    var ANG = 28 * Math.PI / 180, UX = Math.cos(ANG), UY = Math.sin(ANG);
    var lastW = 0, resizeTimer = null;

    /* Measure the element, never innerWidth. On a phone innerWidth is the
       visual viewport, which grows the moment anything on the page runs a few
       pixels too wide. Writing that number back as an explicit CSS width made
       the canvas wider than the page, which made the page wider again. The two
       fed each other and the whole document slid sideways under the thumb.
       #fx is pinned to all four edges, so its own box is already correct. */
    function measure() {
      var r = cv.getBoundingClientRect();
      return { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) };
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, TOUCH ? 1.25 : 2);
      var m = measure();
      W = cv.width = Math.floor(m.w * dpr);
      H = cv.height = Math.floor(m.h * dpr);
      lastW = m.w;
    }
    size();

    /* Mobile browsers fire resize every time the URL bar slides. Reallocating a
       full-resolution canvas on each one is what locks the page up, so ignore
       height-only changes and debounce the rest. */
    addEventListener('resize', function () {
      if (measure().w === lastW) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(size, 220);
    }, { passive: true });

    function spawn() {
      var seed = Math.random();
      streaks.push({
        x: (-1.15 + Math.random() * 2.05) * W,
        y: (-0.95 + Math.random() * 0.95) * H,
        len: (160 + Math.random() * 340) * dpr,
        sp: (9 + Math.random() * 13) * dpr,
        w: (Math.random() < 0.28 ? 2.1 : 1.15) * dpr,
        a: (seed < 0.34 && seed >= 0.20 ? 0.42 : 0.30) + Math.random() * 0.50,
        tint: seed < 0.20 ? '45,212,255' : (seed < 0.34 ? '212,162,76' : '255,255,255')
      });
      if (streaks.length > MAX) streaks.shift();
    }

    function schedule() {
      setTimeout(function () {
        if (!document.hidden) {
          spawn();
          if (Math.random() < (TOUCH ? 0.25 : 0.42)) setTimeout(spawn, 110 + Math.random() * 240);
          if (!TOUCH && Math.random() < 0.16) setTimeout(spawn, 260 + Math.random() * 320);
        }
        schedule();
      }, (TOUCH ? 1100 : 700) + Math.random() * 2100);
    }

    function draw() {
      requestAnimationFrame(draw);
      if (document.hidden) return;
      if (!streaks.length) { if (dirty) { ctx.clearRect(0, 0, W, H); dirty = false; } return; }
      dirty = true;
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';

      for (var i = streaks.length - 1; i >= 0; i--) {
        var s = streaks[i];
        s.x += UX * s.sp; s.y += UY * s.sp;
        var hx = s.x, hy = s.y, tx = s.x - UX * s.len, ty = s.y - UY * s.len;

        /* Two strokes instead of ctx.shadowBlur, which is brutally slow on phones. */
        var gw = ctx.createLinearGradient(tx, ty, hx, hy);
        gw.addColorStop(0, 'rgba(' + s.tint + ',0)');
        gw.addColorStop(1, 'rgba(' + s.tint + ',' + (s.a * 0.22).toFixed(3) + ')');
        ctx.strokeStyle = gw; ctx.lineWidth = s.w * 5;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();

        var g = ctx.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, 'rgba(' + s.tint + ',0)');
        g.addColorStop(0.7, 'rgba(' + s.tint + ',' + (s.a * 0.5).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + s.tint + ',' + s.a.toFixed(3) + ')');
        ctx.strokeStyle = g; ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();

        if (tx > W + 60 * dpr || ty > H + 60 * dpr) streaks.splice(i, 1);
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) ctx.clearRect(0, 0, W, H);
    });

    schedule();
    requestAnimationFrame(draw);
    setTimeout(function () { cv.classList.add('on'); }, 400);
  })();

  /* ---------------- THUMB PRESS ----------------
     iOS never fires :hover from a finger, and only fires :active when a touch
     listener exists. So drive it explicitly with a .lit class. Do NOT clear on
     scroll events: iOS rubber-bands the instant you touch down and would wipe
     the highlight before it is ever visible. Watch real scroll distance. */
  var LIT_SEL = 'a.card, .btn, .nav-links a';
  var litTimer = null, touchStartY = 0, scrolling = false;

  function clearLit() {
    var on = document.querySelectorAll('.lit');
    for (var i = 0; i < on.length; i++) on[i].classList.remove('lit');
  }
  function lightAt(x, y) {
    var node = document.elementFromPoint(x, y);
    var el = (node && node.closest) ? node.closest(LIT_SEL) : null;
    if (!el) { clearLit(); return; }
    if (el.classList.contains('lit')) return;
    clearLit(); el.classList.add('lit');
  }

  document.addEventListener('touchstart', function (e) {
    clearTimeout(litTimer); scrolling = false; touchStartY = window.pageYOffset;
    var t = e.touches[0]; if (t) lightAt(t.clientX, t.clientY);
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (scrolling) return;
    if (Math.abs(window.pageYOffset - touchStartY) > 6) { scrolling = true; clearLit(); return; }
    var t = e.touches[0]; if (t) lightAt(t.clientX, t.clientY);
  }, { passive: true });

  document.addEventListener('touchend', function () {
    clearTimeout(litTimer); litTimer = setTimeout(clearLit, 1400);
  }, { passive: true });

  document.addEventListener('touchcancel', function () {
    clearTimeout(litTimer); litTimer = setTimeout(clearLit, 400);
  }, { passive: true });

  /* ---------------- PHONE MENU ----------------
     Four links, a language picker and a music dot never fit one phone row, and
     Spanish is longer than English in every label. So below the breakpoint the
     links drop into a panel under the bar. The router never swaps the header,
     so this binds once and stays bound. */
  (function menu() {
    var nav = document.querySelector('.nav');
    var btn = document.getElementById('menu');
    if (!nav || !btn) return;

    function shut() {
      if (!nav.classList.contains('open')) return;
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* Tapping a link closes the panel, including the ones the router handles
       without a page load. */
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.nav-links a')) shut();
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) shut();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) shut();
    });
    addEventListener('popstate', shut);
    /* Turning the phone sideways can put the links back in the bar. */
    addEventListener('resize', function () {
      if (innerWidth > 760) shut();
    }, { passive: true });
  })();

  /* ---------------- PER PAGE SETUP ----------------
     Everything below has to run again after a soft navigation swaps <main>,
     so it lives in one function the router can call. */
  window.__IO = window.__IO || {};

  window.__IO.page = function () {
    /* Instagram, TikTok, YouTube and X publish universal links that hand off
       to their app. Chrome on iOS handles that badly from a target=_blank
       tab: blank tab, stall, bounce back. A normal top level navigation
       works every time. */
    if (TOUCH) {
      var ext = document.querySelectorAll('a[target="_blank"]');
      for (var i = 0; i < ext.length; i++) {
        ext[i].removeAttribute('target');
        ext[i].setAttribute('rel', 'noopener');
      }
    }

    var reveals = document.querySelectorAll('.reveal:not(.in)');
    if (REDUCED || !('IntersectionObserver' in window)) {
      for (var r = 0; r < reveals.length; r++) reveals[r].classList.add('in');
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      for (var k = 0; k < reveals.length; k++) io.observe(reveals[k]);
    }

    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  };

  window.__IO.page();
})();
