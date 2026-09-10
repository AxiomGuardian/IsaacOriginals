/* ==========================================================================
   Isaac Originals — sound
   Which file plays where, written down so it never has to be dug out of the
   code again:

     tab-selection.mp3  nav links and the footer link
     tactile-cta.mp3    every .btn that is not a contact button
     two-missions.mp3   venture cards and K.I.T. tool cards, on press
     get-in-touch.mp3   contact buttons, [data-sound="contact"]
     bed-1/2/3.mp3      the three rebrand tracks, played straight through
                        in order and then round again

   There is no hover sound. Sweeping a cursor across a grid of cards fired it
   four times in a row and it read as noise rather than texture.

   Levels are deliberately low. Background music that you notice is background
   music that is too loud.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Real touch hardware, not a user-agent guess. The old Safari sniff matched
     desktop Safari too and handed a laptop the phone-speaker gain. */
  var TOUCH = matchMedia('(hover: none)').matches;

  var BED_VOL     = TOUCH ? 0.16 : 0.055;
  var FADE_IN     = 3.0;
  var FADE_RESUME = 1.2;
  var FADE_TOGGLE = 1.4;
  var TRACKS      = ['bed-1.mp3', 'bed-2.mp3', 'bed-3.mp3'];

  /* ---------------- ONE SHOTS ---------------- */
  function cue(src, vol) {
    var a = new Audio('assets/audio/' + src);
    a.volume = vol; a.preload = 'auto';
    return a;
  }
  var cues = {
    tab:      cue('tab-selection.mp3', 0.26),
    tactile:  cue('tactile-cta.mp3',   0.26),
    missions: cue('two-missions.mp3',  0.30),
    contact:  cue('get-in-touch.mp3',  0.30)
  };

  function play(key) {
    var s = cues[key];
    if (!s || !unlocked) return;
    try { s.currentTime = 0; s.play().catch(function () {}); } catch (e) {}
  }

  /* Fires on the press rather than the click so the sound lands with the
     finger, not after the navigation has already started. */
  function bind(sel, key) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        if (el['__snd_' + key]) return;
        el['__snd_' + key] = true;
        el.addEventListener('mousedown', function () { play(key); });
        el.addEventListener('touchstart', function () { play(key); }, { passive: true });
      })(els[i]);
    }
  }

  /* ---------------- MUSIC BED ----------------
     One element, three tracks. When a track ends the next one is loaded into
     the same element, which keeps the Web Audio graph intact and means only
     the track being listened to is ever downloaded. Nothing is crossfaded
     into itself, so it never sounds like two pieces of music at once. */
  var idx = parseInt(sessionStorage.getItem('io-bed-index') || '0', 10);
  if (!(idx >= 0 && idx < TRACKS.length)) idx = 0;

  var bed = new Audio();
  bed.preload = 'auto';
  bed.src = 'assets/audio/' + TRACKS[idx];

  bed.addEventListener('ended', function () {
    idx = (idx + 1) % TRACKS.length;
    sessionStorage.setItem('io-bed-index', String(idx));
    sessionStorage.setItem('io-bed-pos', '0');
    bed.src = 'assets/audio/' + TRACKS[idx];
    if (enabled) bed.play().catch(function () {});
  });

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

    var at = parseFloat(sessionStorage.getItem('io-bed-pos') || '0');
    function seekThenPlay() {
      if (at > 0 && bed.duration && at < bed.duration - 2) {
        try { bed.currentTime = at; } catch (e) {}
      }
      bed.play().then(function () {
        playing = true;
        sessionStorage.setItem('io-music-playing', '1');
        fade(BED_VOL, at > 0 ? FADE_RESUME : FADE_IN);
        paint();
      }).catch(function () { started = false; });
    }
    function go() {
      if (at > 0 && !bed.duration) bed.addEventListener('loadedmetadata', seekThenPlay, { once: true });
      else seekThenPlay();
    }
    if (actx.state === 'suspended') actx.resume().then(go).catch(function () { started = false; });
    else go();
  }

  function remember() {
    if (playing) {
      sessionStorage.setItem('io-bed-pos', String(bed.currentTime));
      sessionStorage.setItem('io-bed-index', String(idx));
      sessionStorage.setItem('io-music-playing', '1');
    }
  }
  addEventListener('pagehide', remember);
  addEventListener('beforeunload', remember);
  document.addEventListener('visibilitychange', function () { if (document.hidden) remember(); });

  /* ---------------- FIRST GESTURE ----------------
     If that first gesture is the music button itself, the bed must not
     auto-start here: the button's own handler decides, and starting it first
     would leave the two fighting over the same press. */
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
        if (!started) { start(); setTimeout(function () { busy = false; paint(); }, 1800); }
        else {
          if (actx && actx.state === 'suspended') actx.resume();
          bed.play().catch(function () {});
          fade(BED_VOL, FADE_TOGGLE);
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
  bind('[data-sound="contact"]', 'contact');

  paint();
  if (unlocked && enabled && sessionStorage.getItem('io-music-playing') === '1') start();
})();
