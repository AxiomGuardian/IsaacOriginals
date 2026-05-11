/* ============================================================
   IsaacOriginals — UI Sound Effects v6
   Instant playback on mousedown/touchstart.
   Exposes __IO.initSounds() for SPA reinit.
   ============================================================ */
(function () {
  'use strict';

  window.__IO = window.__IO || {};

  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function makeSound(src, vol) {
    var a = new Audio(src);
    a.volume = vol;
    a.preload = 'auto';
    return a;
  }

  var sounds = {
    tab:        makeSound('/assets/audio/tab-selection.mp3', 0.8),
    tactile:    makeSound('/assets/audio/tactile-cta.mp3', 0.8),
    missions:   makeSound('/assets/audio/two-missions.mp3', 0.85),
    hover:      makeSound('/assets/audio/hover-over.mp3', 1.0),
    getInTouch: makeSound('/assets/audio/get-in-touch.mp3', 0.85)
  };

  Object.keys(sounds).forEach(function (k) { sounds[k].load(); });

  var audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    sessionStorage.setItem('io-audio-unlocked', '1');
    Object.keys(sounds).forEach(function (k) {
      var s = sounds[k];
      var orig = s.volume;
      s.volume = 0;
      s.play().then(function () { s.pause(); s.currentTime = 0; s.volume = orig; })
        .catch(function () { s.volume = orig; });
    });
  }

  if (sessionStorage.getItem('io-audio-unlocked') === '1') unlockAudio();
  document.addEventListener('touchstart', unlockAudio, { capture: true, once: true });
  document.addEventListener('click', unlockAudio, { capture: true, once: true });

  function play(key) {
    var s = sounds[key];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(function () {});
  }

  // Sound handoff from previous page (non-SPA fallback)
  var pending = sessionStorage.getItem('io-sound-handoff');
  if (pending) {
    sessionStorage.removeItem('io-sound-handoff');
    setTimeout(function () { play(pending); }, 100);
  }

  /* ── Attach listeners to current DOM ── */
  function initSounds() {
    // Nav tabs
    document.querySelectorAll('.nav-link, #mobile-menu a').forEach(function (el) {
      if (el.__snd) return;
      el.__snd = true;
      el.addEventListener('mousedown', function () { play('tab'); });
      if (isTouch) el.addEventListener('touchstart', function () { play('tab'); }, { passive: true });
    });

    // Tactile CTAs (including welcome button)
    document.querySelectorAll('[data-sound="tactile"]').forEach(function (el) {
      if (el.__snd) return;
      el.__snd = true;
      el.addEventListener('mousedown', function () { play('tactile'); });
      if (isTouch) el.addEventListener('touchstart', function () { play('tactile'); }, { passive: true });
    });

    // Mission cards
    document.querySelectorAll('[data-sound="missions"]').forEach(function (el) {
      if (el.__snd) return;
      el.__snd = true;
      el.addEventListener('mousedown', function () { play('missions'); });
      if (isTouch) el.addEventListener('touchstart', function () { play('missions'); }, { passive: true });
    });

    // Contact buttons
    document.querySelectorAll('[data-sound="contact"]').forEach(function (el) {
      if (el.__snd) return;
      el.__snd = true;
      el.addEventListener('mousedown', function () { play('getInTouch'); });
      if (isTouch) el.addEventListener('touchstart', function () { play('getInTouch'); }, { passive: true });
    });

    // Hover/tap cards
    document.querySelectorAll('[data-sound="hover"]').forEach(function (el) {
      if (el.__snd) return;
      el.__snd = true;
      el.addEventListener('mouseenter', function () { play('hover'); });
      if (isTouch) el.addEventListener('touchstart', function () { play('hover'); }, { passive: true });
    });
  }

  // Init on load
  initSounds();

  // Expose for SPA reinit
  window.__IO.initSounds = initSounds;

})();
