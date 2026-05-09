/* ============================================================
   IsaacOriginals — UI Sound Effects
   Tactile audio feedback on navigation, buttons, and hovers.
   Supports both desktop (mouseenter) and touch (tap) devices.
   ============================================================ */

(function () {
  'use strict';

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Preload all sounds
  const sounds = {
    tab: new Audio('/assets/audio/tab-selection.mp3'),
    tactile: new Audio('/assets/audio/tactile-cta.mp3'),
    missions: new Audio('/assets/audio/two-missions.mp3'),
    hover: new Audio('/assets/audio/hover-over.mp3'),
    getInTouch: new Audio('/assets/audio/get-in-touch.mp3'),
  };

  // Set volume
  Object.values(sounds).forEach(s => {
    s.volume = 0.7;
    s.preload = 'auto';
  });

  // Safari audio unlock — must play a sound on first user gesture
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    Object.values(sounds).forEach(s => {
      s.play().then(() => { s.pause(); s.currentTime = 0; }).catch(() => {});
    });
    audioUnlocked = true;
    document.removeEventListener('touchstart', unlockAudio, true);
    document.removeEventListener('click', unlockAudio, true);
  }
  document.addEventListener('touchstart', unlockAudio, { capture: true, once: true });
  document.addEventListener('click', unlockAudio, { capture: true, once: true });

  // Play a sound — resets to start if already playing
  function play(key) {
    const s = sounds[key];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
  }

  // Helper: bind both mouse and touch events for hover-type sounds
  function bindHoverSound(el, key) {
    // Desktop: mouseenter
    el.addEventListener('mouseenter', () => play(key));
    // Touch devices: play on tap (touchstart) for cards that aren't links
    if (isTouch) {
      el.addEventListener('touchstart', () => play(key), { passive: true });
    }
  }

  // --- Nav tab clicks ---
  document.querySelectorAll('.nav-link, #mobile-menu a').forEach(el => {
    el.addEventListener('click', () => play('tab'));
  });

  // --- Hero CTA buttons (The Journey, About Isaac) ---
  document.querySelectorAll('[data-sound="tactile"]').forEach(el => {
    el.addEventListener('click', () => play('tactile'));
  });

  // --- Two missions cards (delay navigation so sound plays through) ---
  document.querySelectorAll('[data-sound="missions"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      play('missions');
      const href = el.getAttribute('href') || el.closest('a')?.getAttribute('href');
      if (href) {
        const s = sounds.missions;
        // Navigate when sound ends, or after 1.5s fallback
        let navigated = false;
        const go = () => { if (!navigated) { navigated = true; window.location.href = href; } };
        s.addEventListener('ended', go, { once: true });
        setTimeout(go, 1500);
      }
    });
  });

  // --- Get in touch / contact buttons ---
  document.querySelectorAll('[data-sound="contact"]').forEach(el => {
    el.addEventListener('click', () => play('getInTouch'));
  });

  // --- Hover / tap over interactive cards ---
  document.querySelectorAll('[data-sound="hover"]').forEach(el => {
    bindHoverSound(el, 'hover');
  });

})();
