/* ============================================================
   IsaacOriginals — UI Sound Effects
   Instant tactile audio feedback. Zero delay. All devices.
   ============================================================ */

(function () {
  'use strict';

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Preload all sounds — create multiple instances for instant playback
  function makeSound(src, vol) {
    const a = new Audio(src);
    a.volume = vol;
    a.preload = 'auto';
    return a;
  }

  const sounds = {
    tab:        makeSound('/assets/audio/tab-selection.mp3', 0.8),
    tactile:    makeSound('/assets/audio/tactile-cta.mp3', 0.8),
    missions:   makeSound('/assets/audio/two-missions.mp3', 0.85),
    hover:      makeSound('/assets/audio/hover-over.mp3', 1.0),
    getInTouch: makeSound('/assets/audio/get-in-touch.mp3', 0.85),
  };

  // Pre-buffer: force browsers to fully load audio data
  Object.values(sounds).forEach(s => { s.load(); });

  // Audio unlock — silent play to prime audio on this page
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    sessionStorage.setItem('io-audio-unlocked', '1');
    Object.values(sounds).forEach(s => {
      const orig = s.volume;
      s.volume = 0;
      s.play().then(() => { s.pause(); s.currentTime = 0; s.volume = orig; }).catch(() => { s.volume = orig; });
    });
  }

  // If audio was unlocked on a previous page, unlock immediately on load
  if (sessionStorage.getItem('io-audio-unlocked') === '1') {
    unlockAudio();
  }
  // Also unlock on first gesture as fallback
  document.addEventListener('touchstart', unlockAudio, { capture: true, once: true });
  document.addEventListener('click', unlockAudio, { capture: true, once: true });

  // Play instantly — reset and fire
  function play(key) {
    const s = sounds[key];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
  }

  // On page load: check if a sound should continue from previous page (mission card handoff)
  const pendingSound = sessionStorage.getItem('io-sound-handoff');
  if (pendingSound) {
    sessionStorage.removeItem('io-sound-handoff');
    // Small delay to let page settle, then play the carried-over sound
    setTimeout(() => play(pendingSound), 100);
  }

  // --- Nav tab clicks (instant on mousedown, not click) ---
  document.querySelectorAll('.nav-link, #mobile-menu a').forEach(el => {
    el.addEventListener('mousedown', () => play('tab'));
    if (isTouch) el.addEventListener('touchstart', () => play('tab'), { passive: true });
  });

  // --- Hero CTA buttons (instant on mousedown) ---
  document.querySelectorAll('[data-sound="tactile"]').forEach(el => {
    el.addEventListener('mousedown', () => play('tactile'));
    if (isTouch) el.addEventListener('touchstart', () => play('tactile'), { passive: true });
  });

  // --- Two missions cards (play + navigate instantly, sound hands off to next page) ---
  document.querySelectorAll('[data-sound="missions"]').forEach(el => {
    el.addEventListener('mousedown', () => {
      play('missions');
      sessionStorage.setItem('io-sound-handoff', 'missions');
    });
    if (isTouch) {
      el.addEventListener('touchstart', () => {
        play('missions');
        sessionStorage.setItem('io-sound-handoff', 'missions');
      }, { passive: true });
    }
    // Let the link navigate normally — no preventDefault
  });

  // --- Get in touch / contact buttons (instant on mousedown) ---
  document.querySelectorAll('[data-sound="contact"]').forEach(el => {
    el.addEventListener('mousedown', () => play('getInTouch'));
    if (isTouch) el.addEventListener('touchstart', () => play('getInTouch'), { passive: true });
  });

  // --- Hover / tap over interactive cards ---
  document.querySelectorAll('[data-sound="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => play('hover'));
    if (isTouch) el.addEventListener('touchstart', () => play('hover'), { passive: true });
  });

})();
