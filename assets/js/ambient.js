/* ============================================================
   IsaacOriginals — Ambient Music System v2
   ─ HYPERION ambient track · crossfade loop
   ─ Delta entrance sound synced to loader
   ─ Canvas circular-ripple visualizer (sonar style)
   ─ Fast resume across page navigation
   ============================================================ */
(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────────── */
  const AMBIENT_VOL   = 0.1;          // master volume for ambient track
  const DELTA_VOL     = 0.55;         // delta entrance sound volume
  const FADE_IN_MS    = 2500;         // ambient fade-in (first play)
  const RESUME_FADE   = 1200;         // faster fade when resuming across pages
  const FADE_OUT_MS   = 2500;         // crossfade-out duration
  const XFADE_LEAD    = 8;            // seconds before track end to start crossfade
  const RING_LIFE     = 2000;         // ms for a ring to expand + fade
  const RING_INTERVAL = 650;          // base ms between ring spawns
  const VIZ_PX        = 34;           // visualizer canvas size (css px)

  /* ── Audio Elements ────────────────────────────────────── */
  const delta   = new Audio('/assets/audio/delta-entrance.mp3');
  delta.volume  = DELTA_VOL;
  delta.preload = 'auto';

  const ambient   = new Audio('/assets/audio/ambient-hyperion.mp3');
  ambient.volume  = 0;
  ambient.preload = 'auto';
  ambient.loop    = false;                // manual crossfade loop

  /* ── Web Audio API (lazy — created on first gesture) ──── */
  let actx, analyser, srcNode, freqBuf;

  function bootAudio() {
    if (actx) return;
    try {
      actx     = new (window.AudioContext || window.webkitAudioContext)();
      analyser = actx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;
      srcNode  = actx.createMediaElementSource(ambient);
      srcNode.connect(analyser);
      analyser.connect(actx.destination);
      freqBuf  = new Uint8Array(analyser.frequencyBinCount);
      if (actx.state === 'suspended') actx.resume();
    } catch (_) { /* fallback: visualizer pulses gently without freq data */ }
  }

  /* ── State ─────────────────────────────────────────────── */
  let playing  = false;
  let enabled  = sessionStorage.getItem('io-music-enabled') !== 'false';
  let unlocked = sessionStorage.getItem('io-audio-unlocked') === '1';
  let started  = false;

  const savedPos   = parseFloat(sessionStorage.getItem('io-ambient-position') || '0');
  const wasPlaying = sessionStorage.getItem('io-music-playing') === '1';

  /* ── Fade Helpers ──────────────────────────────────────── */
  function fadeIn(audio, target, ms) {
    audio.volume = 0;
    const N = 25, dt = ms / N, dv = target / N;
    let n = 0;
    const id = setInterval(() => {
      audio.volume = Math.min(dv * ++n, target);
      if (n >= N) clearInterval(id);
    }, dt);
  }

  function fadeOut(audio, ms) {
    const v0 = audio.volume;
    if (!v0) return Promise.resolve();
    const N = 25, dt = ms / N, dv = v0 / N;
    let n = 0;
    return new Promise(done => {
      const id = setInterval(() => {
        audio.volume = Math.max(v0 - dv * ++n, 0);
        if (n >= N) { clearInterval(id); done(); }
      }, dt);
    });
  }

  /* ── Crossfade Loop ────────────────────────────────────── */
  function initCrossfade() {
    setInterval(() => {
      if (!playing || !enabled || ambient._xf) return;
      const rem = ambient.duration - ambient.currentTime;
      if (rem > 0 && rem <= XFADE_LEAD && ambient.duration > 0) {
        ambient._xf = true;
        fadeOut(ambient, FADE_OUT_MS).then(() => {
          ambient.currentTime = 0;
          fadeIn(ambient, AMBIENT_VOL, FADE_IN_MS);
          ambient._xf = false;
        });
      }
    }, 1000);
  }

  /* ── Start / Resume Ambient ────────────────────────────── */
  function startAmbient() {
    if (started || !enabled) return;
    started = true;

    // Restore position from previous page
    if (savedPos > 0) ambient.currentTime = savedPos;
    const fadeDur = savedPos > 0 ? RESUME_FADE : FADE_IN_MS;

    ambient.play().then(() => {
      playing = true;
      sessionStorage.setItem('io-music-playing', '1');
      bootAudio();
      fadeIn(ambient, AMBIENT_VOL, fadeDur);
      initCrossfade();
    }).catch(() => {
      started = false;   // autoplay blocked — retry on gesture
    });
  }

  /* ── Delta Entrance (synced to loader video) ───────────── */
  function handleDelta() {
    const loader = document.getElementById('page-loader');
    const done   = sessionStorage.getItem('io-loader-played');

    if (!loader || done) {
      // No loader on this page, or already played this session
      if (unlocked) setTimeout(startAmbient, 600);
      return;
    }

    // Sync delta sound with the loader video's play event
    // (video.play() is triggered by a user gesture / autoplay, so delta
    //  piggybacks on that same gesture for Safari audio-unlock)
    const video = document.getElementById('loader-video');
    if (video) {
      video.addEventListener('play', () => {
        delta.play().catch(() => {});
      }, { once: true });
    }

    // Watch for loader to finish (class 'done' added by main.js)
    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.target.classList && m.target.classList.contains('done')) {
          obs.disconnect();
          setTimeout(startAmbient, 400);
          return;
        }
      }
    });
    obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── Persist Position Across Pages ─────────────────────── */
  window.addEventListener('beforeunload', () => {
    if (playing) {
      sessionStorage.setItem('io-ambient-position', String(ambient.currentTime));
      sessionStorage.setItem('io-music-playing', '1');
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing)
      sessionStorage.setItem('io-ambient-position', String(ambient.currentTime));
  });

  /* ── Unlock Audio on First Gesture ─────────────────────── */
  function onGesture() {
    if (unlocked) return;
    unlocked = true;
    sessionStorage.setItem('io-audio-unlocked', '1');
    if (actx && actx.state === 'suspended') actx.resume();
    if (!started && enabled) startAmbient();
  }

  document.addEventListener('click',      onGesture, { once: true });
  document.addEventListener('touchstart', onGesture, { once: true });

  /* ── Circular Ripple Visualizer ─────────────────────────── */
  const DPR = window.devicePixelRatio || 1;
  let canvas, ctx, vizBtn;
  const rings = [];

  function createViz() {
    const nav = document.querySelector('.glass-nav .max-w-6xl');
    if (!nav) return;

    /* Button wrapper */
    vizBtn = document.createElement('button');
    vizBtn.id = 'music-toggle';
    vizBtn.setAttribute('aria-label', 'Toggle ambient music');

    /* Responsive positioning via injected style */
    const s = document.createElement('style');
    s.textContent =
      '#music-toggle{position:absolute;top:50%;transform:translateY(-50%);' +
      'right:24px;width:' + VIZ_PX + 'px;height:' + VIZ_PX + 'px;' +
      'padding:0;cursor:pointer;background:none;border:none;z-index:51;}' +
      '@media(max-width:767px){#music-toggle{right:52px;}}';
    document.head.appendChild(s);

    /* Canvas (retina-ready) */
    canvas = document.createElement('canvas');
    canvas.width  = VIZ_PX * DPR;
    canvas.height = VIZ_PX * DPR;
    canvas.style.width  = VIZ_PX + 'px';
    canvas.style.height = VIZ_PX + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    vizBtn.appendChild(canvas);
    nav.style.position = 'relative';
    nav.appendChild(vizBtn);

    /* Toggle music on click — debounced to prevent rapid-tap glitch */
    var toggling = false;

    vizBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (toggling) return;       // ignore taps while fading
      toggling = true;

      enabled = !enabled;
      sessionStorage.setItem('io-music-enabled', String(enabled));

      if (enabled) {
        if (!started) {
          startAmbient();
          setTimeout(function () { toggling = false; }, 1600);
        } else {
          ambient.play();
          fadeIn(ambient, AMBIENT_VOL, 1500);
          playing = true;
          sessionStorage.setItem('io-music-playing', '1');
          setTimeout(function () { toggling = false; }, 1600);
        }
      } else {
        fadeOut(ambient, 1500).then(function () {
          ambient.pause();
          playing = false;
          sessionStorage.setItem('io-music-playing', '0');
          toggling = false;
        });
      }
    });
  }

  /* Get normalised audio intensity (0-1) from analyser */
  function getIntensity() {
    if (!analyser || !freqBuf || !playing || !enabled) return 0;
    analyser.getByteFrequencyData(freqBuf);
    let sum = 0;
    for (let i = 0; i < freqBuf.length; i++) sum += freqBuf[i];
    return sum / (freqBuf.length * 255);
  }

  /* Render one frame of the ripple visualizer */
  let lastSpawn = 0;

  function vizFrame(now) {
    if (!ctx) { requestAnimationFrame(vizFrame); return; }

    const cx   = VIZ_PX / 2;
    const cy   = VIZ_PX / 2;
    const maxR = VIZ_PX / 2 - 1;

    ctx.clearRect(0, 0, VIZ_PX, VIZ_PX);

    const amp = getIntensity();

    /* Spawn new ring */
    const spawnRate = (playing && enabled)
      ? Math.max(RING_INTERVAL - amp * 250, 320)
      : 1500;

    if (now - lastSpawn > spawnRate) {
      rings.push({ born: now, amp: Math.max(amp, 0.2) });
      if (rings.length > 8) rings.shift();
      lastSpawn = now;
    }

    /* Draw expanding rings */
    for (let i = rings.length - 1; i >= 0; i--) {
      var ring = rings[i];
      var age  = now - ring.born;
      var p    = age / RING_LIFE;             // 0 → 1

      if (p > 1) { rings.splice(i, 1); continue; }

      var ease   = 1 - Math.pow(1 - p, 2.5);  // ease-out curve
      var radius = 2.5 + ease * (maxR - 2.5);
      var alpha  = ring.amp * (1 - p) * 0.6;
      var lw     = 1.4 * (1 - p * 0.4);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = lw;
      ctx.stroke();
    }

    /* Centre dot — subtle pulse with music */
    var dotR = (playing && enabled) ? 1.8 + amp * 1.2 : 1.5;
    var dotA = (playing && enabled) ? 0.4 + amp * 0.35 : 0.18;

    ctx.beginPath();
    ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,' + dotA.toFixed(3) + ')';
    ctx.fill();

    requestAnimationFrame(vizFrame);
  }

  /* ── Initialise ────────────────────────────────────────── */
  createViz();
  handleDelta();
  requestAnimationFrame(vizFrame);

  // Fast resume: if audio was previously unlocked & playing, restart immediately
  if (unlocked && enabled && wasPlaying) {
    startAmbient();
  }

})();
