/* ==========================================================================
   Isaac Originals — load in sequence

   The delta plays. As it settles, Welcome fades up over the top of it rather
   than after it, so the two overlap instead of leaving a gap. Pressing
   Welcome drops the curtain.

   Browsers split on sound here, so the sequence is built to satisfy both:

     Chrome  allows audio to start on its own. The entrance hit and the music
             both begin under the video, and Welcome only drops the curtain.
     Safari  refuses any sound until someone interacts. Nothing plays under
             the video. The music starts on the Welcome press, and the
             entrance hit is skipped rather than fired late, because a
             cinematic cue landing after the animation is over reads as a
             mistake.

   Either way the visitor sees the same thing. Only the sound differs, and
   only where the browser forces it to.

   Runs once a session. Soft navigations never touch it, and a reload inside
   the same session skips straight past.
   ========================================================================== */
(function () {
  'use strict';

  window.__IO = window.__IO || {};

  /* ---------------- ALWAYS OPEN AT THE TOP ----------------
     Sharing a page out of Safari copies whatever sits in the address bar, and
     that includes the fragment. Tap THE WORK, then share, and the link your
     friend receives is /#ventures, which drops them halfway down the page
     with nothing to explain why. Browsers also restore the last scroll
     position on their own.

     Internal links never reach here, because the router swaps <main> without
     a document load. So any full load of this page is somebody arriving from
     outside, and they should land at the top every time. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function toTop() {
    var html = document.documentElement;
    var smooth = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';    /* never animate the correction */
    window.scrollTo(0, 0);
    html.style.scrollBehavior = smooth;
  }

  if (location.hash) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }
  toTop();
  addEventListener('DOMContentLoaded', toTop);
  addEventListener('load', toTop);

  var el = document.getElementById('loader');
  if (!el) return;

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gate  = document.getElementById('welcome-gate');
  var video = document.getElementById('loader-video');
  var done  = false, opened = false;

  /* How far from the end of the clip the button starts fading up. The fade
     itself runs about a second and a quarter, so it finishes roughly as the
     delta comes to rest. */
  var LEAD = 1.6;

  function clear() {
    el.classList.add('done');
    document.body.classList.remove('loading');
    /* Releasing the scroll lock is the other moment a browser can put the
       page back where it thinks it was. */
    toTop();
    setTimeout(toTop, 60);
  }

  function skip() { el.style.transition = 'none'; clear(); done = true; }

  if (sessionStorage.getItem('io-loader-played') || REDUCED) { skip(); return; }

  document.body.classList.add('loading');

  function dismiss() {
    if (done) return;
    done = true;
    sessionStorage.setItem('io-loader-played', '1');
    clear();
    /* Safari will not have been allowed to start anything yet. This press is
       the gesture that changes that. On Chrome it is already running and
       this call finds it playing and leaves it alone. */
    if (window.__IO.begin) window.__IO.begin();
    setTimeout(function () {
      /* Stop the clip before pulling it out of the document, or the pending
         play promise rejects with an AbortError into the console. */
      try { if (video) { video.pause(); video.removeAttribute('src'); video.load(); } } catch (e) {}
      el.remove();
    }, 1100);
  }

  function openGate() {
    if (done || opened) return;
    opened = true;
    if (!gate) { dismiss(); return; }
    gate.classList.add('visible');
  }

  if (video) {
    /* Watch the playhead rather than waiting for 'ended', so the button is
       already there when the animation finishes. */
    video.addEventListener('timeupdate', function () {
      if (!video.duration || isNaN(video.duration)) return;
      if (video.duration - video.currentTime <= LEAD) openGate();
    });
    video.addEventListener('ended', openGate);
    video.addEventListener('error', openGate);
    /* Never strand anyone behind a black screen if the file stalls. */
    setTimeout(openGate, 9000);

    var p = video.play();
    if (p && p.then) {
      p.then(function () {
        /* The clip is running, so this browser is not blocking playback.
           Try sound under it. Chrome takes it, Safari refuses and we simply
           wait for Welcome. */
        if (window.__IO.entrance) window.__IO.entrance();
        if (window.__IO.begin) window.__IO.begin(true);
      }).catch(function () { setTimeout(openGate, 700); });
    }
  } else {
    setTimeout(openGate, 2400);
  }

  var btn = document.getElementById('welcome-btn');
  if (btn) {
    btn.addEventListener('click', dismiss);
    btn.addEventListener('touchstart', dismiss, { passive: true });
  }

  addEventListener('pageshow', function (e) { if (e.persisted) skip(); });
})();
