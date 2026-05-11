/* ============================================================
   IsaacOriginals — Ambient Music System
   Delta entrance sound synced to loader.
   HYPERION ambient track with crossfade loop.
   Persists across page navigation. Visualizer in nav.
   ============================================================ */

(function () {
  'use strict';

  // --- Configuration ---
  const AMBIENT_VOLUME = 0.5;
  const DELTA_VOLUME = 0.65;
  const FADE_IN_DURATION = 4000;   // ms to fade ambient in
  const FADE_OUT_DURATION = 3000;  // ms to fade ambient out before loop restart
  const CROSSFADE_BUFFER = 8;      // seconds before end to start fade-out for loop

  // --- Audio elements ---
  const deltaSound = new Audio('/assets/audio/delta-entrance.mp3');
  deltaSound.volume = DELTA_VOLUME;
  deltaSound.preload = 'auto';

  const ambient = new Audio('/assets/audio/ambient-hyperion.mp3');
  ambient.volume = 0;
  ambient.preload = 'auto';
  ambient.loop = false; // We handle looping manually for crossfade

  // --- State ---
  let musicPlaying = false;
  let musicEnabled = true;
  let userHasInteracted = false;
  let ambientStarted = false;

  // Check if user previously enabled/disabled music
  const musicPref = sessionStorage.getItem('io-music-enabled');
  if (musicPref === 'false') musicEnabled = false;

  // Resume playback position from previous page
  const savedPosition = parseFloat(sessionStorage.getItem('io-ambient-position') || '0');

  // --- Smooth fade helpers ---
  function fadeIn(audio, targetVol, duration) {
    audio.volume = 0;
    const steps = 30;
    const stepTime = duration / steps;
    const volStep = targetVol / steps;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      audio.volume = Math.min(volStep * current, targetVol);
      if (current >= steps) clearInterval(interval);
    }, stepTime);
  }

  function fadeOut(audio, duration) {
    const startVol = audio.volume;
    const steps = 30;
    const stepTime = duration / steps;
    const volStep = startVol / steps;
    let current = 0;
    return new Promise(resolve => {
      const interval = setInterval(() => {
        current++;
        audio.volume = Math.max(startVol - (volStep * current), 0);
        if (current >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, stepTime);
    });
  }

  // --- Crossfade loop ---
  function setupCrossfadeLoop() {
    // Check time periodically for crossfade
    setInterval(() => {
      if (!musicPlaying || !musicEnabled) return;
      const remaining = ambient.duration - ambient.currentTime;
      if (remaining <= CROSSFADE_BUFFER && remaining > 0 && ambient.duration > 0) {
        // Fade out, then restart with fade in
        if (!ambient._fading) {
          ambient._fading = true;
          fadeOut(ambient, FADE_OUT_DURATION).then(() => {
            ambient.currentTime = 0;
            fadeIn(ambient, AMBIENT_VOLUME, FADE_IN_DURATION);
            ambient._fading = false;
          });
        }
      }
    }, 1000);
  }

  // --- Start ambient music ---
  function startAmbient() {
    if (ambientStarted || !musicEnabled) return;
    ambientStarted = true;

    // Set position from previous page
    if (savedPosition > 0 && savedPosition < ambient.duration) {
      ambient.currentTime = savedPosition;
    }

    ambient.play().then(() => {
      musicPlaying = true;
      fadeIn(ambient, AMBIENT_VOLUME, FADE_IN_DURATION);
      setupCrossfadeLoop();
      updateVisualizer();
    }).catch(() => {
      // Autoplay blocked — wait for user gesture
      ambientStarted = false;
    });
  }

  // --- Delta entrance sound (synced to loader) ---
  function playDeltaEntrance() {
    const loader = document.getElementById('page-loader');
    const alreadyPlayed = sessionStorage.getItem('io-loader-played');
    if (!loader || alreadyPlayed) {
      // No loader or already played — start ambient after short delay
      setTimeout(startAmbient, 2000);
      return;
    }

    // Play delta sound with the loader video
    deltaSound.play().catch(() => {});

    // Watch for loader to finish, then start ambient
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.target.classList && m.target.classList.contains('done')) {
          observer.disconnect();
          // Loader just finished — fade in ambient
          setTimeout(startAmbient, 500);
        }
      });
    });
    observer.observe(loader, { attributes: true, attributeFilter: ['class'] });
  }

  // --- Save position before leaving page ---
  window.addEventListener('beforeunload', () => {
    if (musicPlaying) {
      sessionStorage.setItem('io-ambient-position', String(ambient.currentTime));
    }
  });

  // Also save on visibility change (for mobile tab switches)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && musicPlaying) {
      sessionStorage.setItem('io-ambient-position', String(ambient.currentTime));
    }
  });

  // --- Audio unlock on first interaction ---
  function onFirstInteraction() {
    if (userHasInteracted) return;
    userHasInteracted = true;
    sessionStorage.setItem('io-audio-unlocked', '1');

    // Try starting ambient if it hasn't started yet
    if (!ambientStarted && musicEnabled) {
      startAmbient();
    }
  }

  document.addEventListener('click', onFirstInteraction, { once: true });
  document.addEventListener('touchstart', onFirstInteraction, { once: true });

  // If audio was unlocked on a previous page, try autoplay immediately
  if (sessionStorage.getItem('io-audio-unlocked') === '1') {
    userHasInteracted = true;
  }

  // --- Visualizer icon in nav bar ---
  function createVisualizer() {
    const nav = document.querySelector('.glass-nav .max-w-6xl');
    if (!nav) return;

    // Create visualizer button
    const btn = document.createElement('button');
    btn.id = 'music-toggle';
    btn.setAttribute('aria-label', 'Toggle music');
    btn.style.cssText = 'position:absolute;right:24px;top:50%;transform:translateY(-50%);display:flex;align-items:flex-end;gap:2px;height:20px;padding:8px;cursor:pointer;background:none;border:none;z-index:51;';

    // Create 4 equalizer bars
    for (let i = 0; i < 4; i++) {
      const bar = document.createElement('span');
      bar.className = 'eq-bar';
      bar.style.cssText = `display:inline-block;width:3px;background:rgba(255,255,255,0.6);border-radius:1px;transition:height 0.15s ease;height:${4 + i * 3}px;`;
      bar.dataset.index = i;
      btn.appendChild(bar);
    }

    // Position nav container relatively for absolute positioning
    nav.style.position = 'relative';
    nav.appendChild(btn);

    // Toggle music on click
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      musicEnabled = !musicEnabled;
      sessionStorage.setItem('io-music-enabled', String(musicEnabled));

      if (musicEnabled) {
        if (!ambientStarted) {
          startAmbient();
        } else {
          ambient.play();
          fadeIn(ambient, AMBIENT_VOLUME, 1000);
          musicPlaying = true;
        }
      } else {
        fadeOut(ambient, 1000).then(() => {
          ambient.pause();
          musicPlaying = false;
        });
      }
      updateVisualizer();
    });

    return btn;
  }

  // Animate equalizer bars
  function updateVisualizer() {
    const bars = document.querySelectorAll('.eq-bar');
    if (!bars.length) return;

    function animate() {
      if (!musicPlaying || !musicEnabled) {
        // Static low bars when paused
        bars.forEach((bar, i) => {
          bar.style.height = '3px';
          bar.style.opacity = '0.3';
        });
        return;
      }

      bars.forEach((bar) => {
        const h = 4 + Math.random() * 14;
        bar.style.height = h + 'px';
        bar.style.opacity = '0.7';
      });

      requestAnimationFrame(() => {
        setTimeout(animate, 180);
      });
    }
    animate();
  }

  // --- Initialize ---
  createVisualizer();
  playDeltaEntrance();

})();
