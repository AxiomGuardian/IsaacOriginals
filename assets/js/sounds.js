/* ============================================================
   IsaacOriginals — UI Sound Effects
   Tactile audio feedback on navigation, buttons, and hovers.
   ============================================================ */

(function () {
  'use strict';

  // Preload all sounds
  const sounds = {
    tab: new Audio('/assets/audio/tab-selection.mp3'),
    tactile: new Audio('/assets/audio/tactile-cta.mp3'),
    missions: new Audio('/assets/audio/two-missions.mp3'),
    hover: new Audio('/assets/audio/hover-over.mp3'),
    getInTouch: new Audio('/assets/audio/get-in-touch.mp3'),
  };

  // Set volume (adjust as needed)
  Object.values(sounds).forEach(s => {
    s.volume = 0.5;
    s.preload = 'auto';
  });

  // Play a sound — resets to start if already playing
  function play(key) {
    const s = sounds[key];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
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
        const go = () => { window.location.href = href; };
        s.addEventListener('ended', go, { once: true });
        setTimeout(go, 1500);
      }
    });
  });

  // --- Get in touch / contact buttons ---
  document.querySelectorAll('[data-sound="contact"]').forEach(el => {
    el.addEventListener('click', () => play('getInTouch'));
  });

  // --- Hover over interactive cards ---
  document.querySelectorAll('[data-sound="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => play('hover'));
  });

})();
