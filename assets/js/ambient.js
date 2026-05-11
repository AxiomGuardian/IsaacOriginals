/* ============================================================
   IsaacOriginals — Ambient Music System v3
   ─ HYPERION ambient track · crossfade loop
   ─ Delta entrance sound (auto on Chrome, Welcome-click on Safari/iOS)
   ─ Canvas circular-ripple visualizer (sonar style)
   ─ GainNode volume control (works on iOS where audio.volume is read-only)
   ─ Smooth fade in/out via Web Audio linearRamp
   ============================================================ */
(function () {
  'use strict';

  window.__IO = window.__IO || {};

  /* ── Configuration ─────────────────────────────────────── */
  var AMBIENT_VOL   = 0.10;         // target gain (works on iOS via GainNode)
  var DELTA_VOL     = 0.55;         // delta entrance volume
  var FADE_IN_SEC   = 2.5;          // ambient fade-in (first play)
  var RESUME_FADE   = 1.2;          // faster fade when resuming across pages
  var TOGGLE_FADE   = 1.5;          // fade for on/off toggle
  var XFADE_LEAD    = 8;            // seconds before track end to start crossfade
  var XFADE_SEC     = 2.5;          // crossfade duration
  var RING_LIFE     = 2000;         // ms for a ring to expand + fade
  var RING_INTERVAL = 650;          // base ms between ring spawns
  var VIZ_PX        = 34;           // visualizer canvas size (css px)

  /* ── Audio Elements ────────────────────────────────────── */
  var delta   = new Audio('/assets/audio/delta-entrance.mp3');
  delta.volume  = DELTA_VOL;
  delta.preload = 'auto';

  var ambient   = new Audio('/assets/audio/ambient-hyperion.mp3');
  ambient.preload = 'auto';
  ambient.loop    = false;

  /* ── Web Audio API (GainNode for iOS volume control) ──── */
  var actx, gainNode, analyser, srcNode, freqBuf;
  var audioBooted = false;

  function bootAudio() {
    if (audioBooted) return true;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = actx.createGain();
      gainNode.gain.value = 0;            // start silent
      analyser = actx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;
      srcNode = actx.createMediaElementSource(ambient);
      srcNode.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(actx.destination);
      freqBuf = new Uint8Array(analyser.frequencyBinCount);
      if (actx.state === 'suspended') actx.resume();
      audioBooted = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ── Fade via GainNode (works everywhere including iOS) ── */
  function fadeGain(target, sec) {
    if (!gainNode || !actx) return;
    var now = actx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(target, now + sec);
  }

  /* ── State ─────────────────────────────────────────────── */
  var playing  = false;
  var enabled  = sessionStorage.getItem('io-music-enabled') !== 'false';
  var unlocked = sessionStorage.getItem('io-audio-unlocked') === '1';
  var started  = false;
  var deltaPlayed = false;

  var savedPos   = parseFloat(sessionStorage.getItem('io-ambient-position') || '0');
  var wasPlaying = sessionStorage.getItem('io-music-playing') === '1';

  /* ── Crossfade Loop ────────────────────────────────────── */
  function initCrossfade() {
    setInterval(function () {
      if (!playing || !enabled) return;
      if (ambient._xf) return;
      var rem = ambient.duration - ambient.currentTime;
      if (rem > 0 && rem <= XFADE_LEAD && ambient.duration > 0) {
        ambient._xf = true;
        fadeGain(0, XFADE_SEC);
        setTimeout(function () {
          ambient.currentTime = 0;
          fadeGain(AMBIENT_VOL, XFADE_SEC);
          ambient._xf = false;
        }, XFADE_SEC * 1000 + 100);
      }
    }, 1000);
  }

  /* ── Start / Resume Ambient ────────────────────────────── */
  function startAmbient() {
    if (started || !enabled) return;
    started = true;

    if (!bootAudio()) { started = false; return; }

    // Ensure gain is at 0 before playing (prevents iOS blast)
    gainNode.gain.setValueAtTime(0, actx.currentTime);

    if (savedPos > 0) ambient.currentTime = savedPos;
    var fadeSec = savedPos > 0 ? RESUME_FADE : FADE_IN_SEC;

    ambient.play().then(function () {
      playing = true;
      sessionStorage.setItem('io-music-playing', '1');
      fadeGain(AMBIENT_VOL, fadeSec);
      initCrossfade();
    }).catch(function () {
      started = false;
    });
  }

  /* ── Delta Entrance Sound ���─────────────────────────────── */
  function handleDelta() {
    var loader = document.getElementById('page-loader');
    var done   = sessionStorage.getItem('io-loader-played');

    if (!loader || done) {
      if (unlocked) setTimeout(startAmbient, 600);
      return;
    }

    // Try to play Delta during loader (works on Chrome, fails on Safari/iOS)
    var video = document.getElementById('loader-video');
    if (video) {
      video.addEventListener('play', function () {
        delta.play().then(function () {
          deltaPlayed = true;
        }).catch(function () {});
      }, { once: true });
    }

    // Watch for loader to finish → start ambient
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].target.classList && muts[i].target.classList.contains('done')) {
          obs.disconnect();
          setTimeout(startAmbient, 400);
          return;
        }
      }
    });
    obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
  }

  // Expose Delta play for Welcome button (Safari/iOS fallback)
  window.__IO.playDelta = function () {
    if (!deltaPlayed) {
      delta.play().catch(function () {});
      deltaPlayed = true;
    }
  };

  /* ── Persist Position Across Pages ─────────────────────── */
  window.addEventListener('beforeunload', function () {
    if (playing) {
      sessionStorage.setItem('io-ambient-position', String(ambient.currentTime));
      sessionStorage.setItem('io-music-playing', '1');
    }
  });

  document.addEventListener('visibilitychange', function () {
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
  var DPR = window.devicePixelRatio || 1;
  var canvas, ctx, vizBtn;
  var rings = [];

  function createViz() {
    var nav = document.querySelector('.glass-nav .max-w-6xl');
    if (!nav) return;

    vizBtn = document.createElement('button');
    vizBtn.id = 'music-toggle';
    vizBtn.setAttribute('aria-label', 'Toggle ambient music');

    var s = document.createElement('style');
    s.textContent =
      '#music-toggle{position:absolute;top:50%;transform:translateY(-50%);' +
      'right:24px;width:' + VIZ_PX + 'px;height:' + VIZ_PX + 'px;' +
      'padding:0;cursor:pointer;background:none;border:none;z-index:51;}' +
      '@media(max-width:767px){#music-toggle{right:52px;}}';
    document.head.appendChild(s);

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

    /* Toggle — debounced, uses GainNode fades */
    var toggling = false;

    vizBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (toggling) return;
      toggling = true;

      enabled = !enabled;
      sessionStorage.setItem('io-music-enabled', String(enabled));

      if (enabled) {
        if (!started) {
          startAmbient();
          setTimeout(function () { toggling = false; }, 1800);
        } else {
          if (actx && actx.state === 'suspended') actx.resume();
          ambient.play();
          fadeGain(AMBIENT_VOL, TOGGLE_FADE);
          playing = true;
          sessionStorage.setItem('io-music-playing', '1');
          setTimeout(function () { toggling = false; }, (TOGGLE_FADE * 1000) + 200);
        }
      } else {
        fadeGain(0, TOGGLE_FADE);
        setTimeout(function () {
          ambient.pause();
          playing = false;
          sessionStorage.setItem('io-music-playing', '0');
          toggling = false;
        }, (TOGGLE_FADE * 1000) + 200);
      }
    });
  }

  /* Get normalised audio intensity (0-1) from analyser */
  function getIntensity() {
    if (!analyser || !freqBuf || !playing || !enabled) return 0;
    analyser.getByteFrequencyData(freqBuf);
    var sum = 0;
    for (var i = 0; i < freqBuf.length; i++) sum += freqBuf[i];
    return sum / (freqBuf.length * 255);
  }

  /* Render one frame of the ripple visualizer */
  var lastSpawn = 0;

  function vizFrame(now) {
    if (!ctx) { requestAnimationFrame(vizFrame); return; }

    var cx   = VIZ_PX / 2;
    var cy   = VIZ_PX / 2;
    var maxR = VIZ_PX / 2 - 1;
    ctx.clearRect(0, 0, VIZ_PX, VIZ_PX);

    var amp = getIntensity();

    // Spawn rings
    var spawnRate = (playing && enabled)
      ? Math.max(RING_INTERVAL - amp * 250, 320)
      : 1500;

    if (now - lastSpawn > spawnRate) {
      rings.push({ born: now, amp: Math.max(amp, 0.2) });
      if (rings.length > 8) rings.shift();
      lastSpawn = now;
    }

    // Draw expanding rings
    for (var i = rings.length - 1; i >= 0; i--) {
      var ring = rings[i];
      var age  = now - ring.born;
      var p    = age / RING_LIFE;

      if (p > 1) { rings.splice(i, 1); continue; }

      var ease   = 1 - Math.pow(1 - p, 2.5);
      var radius = 2.5 + ease * (maxR - 2.5);
      var alpha  = ring.amp * (1 - p) * 0.6;
      var lw     = 1.4 * (1 - p * 0.4);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = lw;
      ctx.stroke();
    }

    // Centre dot
    var dotR = (playing && enabled) ? 1.8 + amp * 1.2 : 1.5;
    var dotA = (playing && enabled) ? 0.4 + amp * 0.35 : 0.18;
    ctx.beginPath();
    ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,' + dotA.toFixed(3) + ')';
    ctx.fill();

    requestAnimationFrame(vizFrame);
  }

  /* ── Boot ──────────────────────────────────────────────── */
  createViz();
  handleDelta();
  requestAnimationFrame(vizFrame);

  // Fast resume from previous page
  if (unlocked && enabled && wasPlaying) {
    startAmbient();
  }

})();
