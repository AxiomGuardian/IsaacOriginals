/* ==========================================================================
   Isaac Originals — load in sequence
   The delta plays, the Welcome button fades up, and pressing it drops the
   curtain. That press is also the browser gesture that lets any audio start
   at all, which is why the music and the entrance hit both hang off it.

   Runs once a session. Soft navigations never touch it, and a reload inside
   the same session skips straight past.
   ========================================================================== */
(function () {
  'use strict';

  window.__IO = window.__IO || {};

  var el = document.getElementById('loader');
  if (!el) return;

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gate  = document.getElementById('welcome-gate');
  var video = document.getElementById('loader-video');
  var done  = false;

  function skip() {
    el.style.transition = 'none';
    el.classList.add('done');
    document.body.classList.remove('loading');
    done = true;
  }

  if (sessionStorage.getItem('io-loader-played') || REDUCED) { skip(); return; }

  document.body.classList.add('loading');

  function dismiss() {
    if (done) return;
    done = true;
    sessionStorage.setItem('io-loader-played', '1');
    el.classList.add('done');
    document.body.classList.remove('loading');
    /* The entrance hit lands on the transition rather than under the video,
       because before this press nothing is allowed to make a sound. */
    if (window.__IO.entrance) window.__IO.entrance();
    setTimeout(function () { el.remove(); }, 1000);
  }

  function openGate() {
    if (done || !gate) { dismiss(); return; }
    gate.classList.add('visible');
  }

  if (video) {
    video.addEventListener('ended', function () { setTimeout(openGate, 900); });
    video.addEventListener('error', function () { openGate(); });
    /* If the file stalls or the browser refuses to autoplay it, do not strand
       anyone behind a black screen. */
    setTimeout(function () { if (!done) openGate(); }, 9000);
    var p = video.play();
    if (p && p.catch) p.catch(function () { setTimeout(openGate, 600); });
  } else {
    setTimeout(openGate, 2400);
  }

  var btn = document.getElementById('welcome-btn');
  if (btn) {
    btn.addEventListener('click', dismiss);
    btn.addEventListener('touchstart', dismiss, { passive: true });
  }

  /* Coming back through the history cache should not replay anything. */
  addEventListener('pageshow', function (e) { if (e.persisted) skip(); });
})();
