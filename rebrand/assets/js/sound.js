/* ==========================================================================
   Isaac Originals — sound
   Ported from the original site's sounds.js + ambient.js. The mapping of
   which file belongs to which control is written down here on purpose, so
   it never has to be reverse engineered again:

     tab-selection.mp3  nav links and the footer link
     tactile-cta.mp3    every .btn
     two-missions.mp3   venture cards and K.I.T. tool cards, on press
     hover-over.mp3     card hover, pointer devices only
     get-in-touch.mp3   contact buttons, [data-sound="contact"]
     ambient.mp3        background bed, 106s seamless loop, nav toggle

   Browsers refuse audio until the visitor interacts, so nothing plays until
   the first click or tap. The choice is remembered for the session, which
   means the bed carries across pages instead of restarting on every one.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH   = matchMedia('(hover: none)').matches;
  var ua      = navigator.userAgent;
  var IOSISH  = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                /^((?!chrome|android).)*safari/i.test(ua);

  var AMBIENT_VOL = IOSISH ? 0.30 : 0.11;   /* phone speakers need more gain */
  var FADE_IN     = 2.5;
  var FADE_RESUME = 1.0;
  var FADE_TOGGLE = 1.2;

  /* ---------------- ONE SHOTS ---------------- */
  function cue(src, vol) {
    var a = new Audio('assets/audio/' + src);
    a.volume = vol; a.preload = 'auto';
    return a;
  }
  var cues = {
    tab:      cue('tab-selection.mp3', 0.8),
    tactile:  cue('tactile-cta.mp3',   0.8),
    missions: cue('two-missions.mp3',  0.85),
    hover:    cue('hover-over.mp3',    0.55),
    contact:  cue('get-in-touch.mp3',  0.85)
  };

  function play(key) {
    var s = cues[key];
    if (!s || !unlocked) return;
    try { s.currentTime = 0; s.play().catch(function () {}); } catch (e) {}
  }

  /* Fires on mousedown rather than click so the sound lands with the press,
     not after the navigation has already started. */
  function bind(sel, key, evt) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        if (el['__snd_' + key]) return;
        el['__snd_' + key] = true;
        if (evt === 'enter') {
          if (!TOUCH) el.addEventListener('mouseenter', function () { play(key); });
        } else {
          el.addEventListener('mousedown', function () { play(key); });
          el.addEventListener('touchstart', function () { play(key); }, { passive: true });
        }
      })(els[i]);
    }
  }

  /* ---------------- AMBIENT BED ---------------- */
  var bed = new Audio('assets/audio/ambient.mp3');
  bed.preload = 'auto';
  bed.loop = true;                 /* the file is already crossfaded end to end */

  var actx, gain, srcNode, booted = false;
  var unlocked = sessionStorage.getItem('io-audio-unlocked') === '1';
  var enabled  = sessionStorage.getItem('io-music-enabled') !== 'false';
  var playing  = false, started = false;

  function boot() {
    if (booted) return true;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      gain = actx.createGain();
      gain.gain.value = 0;
      srcNode = actx.createMediaElementSource(bed);
      srcNode.connect(gain); gain.connect(actx.destination);
      booted = true;
      return true;
    } catch (e) { return false; }
  }

  /* iOS ignores HTMLAudioElement.volume, so every fade goes through the
     GainNode instead. */
  function fade(to, sec) {
    if (!gain || !actx) return;
    var t = actx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(to, t + sec);
  }

  function start() {
    if (started || !enabled || REDUCED) return;
    started = true;
    if (!boot()) { started = false; return; }
    gain.gain.setValueAtTime(0, actx.currentTime);

    var at = parseFloat(sessionStorage.getItem('io-ambient-position') || '0');
    if (at > 0 && at < bed.duration) { try { bed.currentTime = at; } catch (e) {} }

    function go() {
      bed.play().then(function () {
        playing = true;
        sessionStorage.setItem('io-music-playing', '1');
        fade(AMBIENT_VOL, at > 0 ? FADE_RESUME : FADE_IN);
        paint();
      }).catch(function () { started = false; });
    }
    if (actx.state === 'suspended') actx.resume().then(go).catch(function () { started = false; });
    else go();
  }

  function remember() {
    if (playing) {
      sessionStorage.setItem('io-ambient-position', String(bed.currentTime));
      sessionStorage.setItem('io-music-playing', '1');
    }
  }
  addEventListener('pagehide', remember);
  addEventListener('beforeunload', remember);
  document.addEventListener('visibilitychange', function () { if (document.hidden) remember(); });

  /* ---------------- FIRST GESTURE ----------------
     If that very first gesture happens to be the music button itself, the bed
     must not auto-start here: the button's own handler decides, and starting
     it first would leave the two fighting over the same press. */
  function unlock(e) {
    if (unlocked) return;
    unlocked = true;
    sessionStorage.setItem('io-audio-unlocked', '1');
    for (var k in cues) {
      (function (s) {
        var v = s.volume; s.volume = 0;
        s.play().then(function () { s.pause(); s.currentTime = 0; s.volume = v; })
                .catch(function () { s.volume = v; });
      })(cues[k]);
    }
    var t = e && e.target;
    var onBtn = t && t.closest && t.closest('#music');
    if (enabled && !onBtn) start();
  }
  document.addEventListener('click', unlock, { capture: true, once: true });
  document.addEventListener('touchstart', unlock, { capture: true, once: true });

  /* ---------------- NAV TOGGLE ---------------- */
  var btn = document.getElementById('music'), busy = false;

  function paint() {
    if (!btn) return;
    var on = playing && enabled;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
  }

  if (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (busy) return;
      busy = true;
      /* Decide from whether anything is actually running, not from the stored
         preference. On a page where the bed never started, the first press has
         to turn it on even though the preference already says it is allowed. */
      enabled = !(started && enabled);
      sessionStorage.setItem('io-music-enabled', String(enabled));

      if (enabled) {
        if (!started) { start(); setTimeout(function () { busy = false; paint(); }, 1600); }
        else {
          if (actx && actx.state === 'suspended') actx.resume();
          bed.play().catch(function () {});
          fade(AMBIENT_VOL, FADE_TOGGLE);
          playing = true;
          sessionStorage.setItem('io-music-playing', '1');
          setTimeout(function () { busy = false; paint(); }, FADE_TOGGLE * 1000 + 150);
        }
      } else {
        fade(0, FADE_TOGGLE);
        setTimeout(function () {
          bed.pause(); playing = false;
          sessionStorage.setItem('io-music-playing', '0');
          busy = false; paint();
        }, FADE_TOGGLE * 1000 + 150);
      }
      paint();
    });
  }

  /* ---------------- WIRE IT UP ---------------- */
  bind('.nav-links a, .foot-in a', 'tab');
  bind('.btn:not([data-sound])', 'tactile');
  bind('a.card, .tools .card', 'missions');
  bind('.card', 'hover', 'enter');
  bind('[data-sound="contact"]', 'contact');

  paint();
  /* Carry the bed straight over from the previous page. */
  if (unlocked && enabled && sessionStorage.getItem('io-music-playing') === '1') start();
})();
