/* ==========================================================================
   Isaac Originals — sound
   Which file plays where, written down so it never has to be dug out of the
   code again:

     tab-selection.mp3  nav links and the footer link
     tactile-cta.mp3    every .btn that is not a contact button
     two-missions.mp3   venture cards and K.I.T. tool cards, on press
     get-in-touch.mp3   contact buttons, [data-sound="contact"]
     bed-1/2/3.mp3      the three rebrand tracks, crossfaded one into the
                        next and then round again

   There is no hover sound. Sweeping a cursor across a grid of cards fired it
   four times in a row and it read as noise rather than texture.

   Levels are deliberately low. Background music that you notice is background
   music that is too loud.

   This whole thing is created once and never torn down. Page changes are soft
   navigations, so nothing here restarts and the bed simply keeps playing.
   ========================================================================== */
(function () {
  'use strict';

  window.__IO = window.__IO || {};
  if (window.__IO.sound) return;          /* survive a double include */

  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Real touch hardware, not a user-agent guess. A Safari sniff matches
     desktop Safari too and would hand a laptop the phone-speaker gain. */
  var TOUCH = matchMedia('(hover: none)').matches;

  var BED_VOL   = TOUCH ? 0.16 : 0.055;
  var FADE_IN   = 3.0;
  var FADE_TOG  = 1.4;
  var XFADE     = 6.0;     /* seconds of overlap between two tracks */
  var XLEAD     = 6.5;     /* start the handover this far from the end */
  var TRACKS    = ['bed-1.mp3', 'bed-2.mp3', 'bed-3.mp3'];

  /* ---------------- ONE SHOTS ---------------- */
  function cue(src, vol) {
    var a = new Audio('assets/audio/' + src);
    a.volume = vol; a.preload = 'auto';
    return a;
  }
  var cues = {
    tab:      cue('tab-selection.mp3',    0.26),
    tactile:  cue('tactile-cta.mp3',      0.26),
    missions: cue('two-missions.mp3',     0.30),
    contact:  cue('get-in-touch.mp3',     0.30),
    entrance: cue('delta-entrance.mp3',   0.45)
  };

  /* The loader calls this the moment Welcome is pressed. */
  window.__IO.entrance = function () { play('entrance'); };

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

  /* ---------------- TWO DECKS ----------------
     One track cannot fade into the next through a single element, so there
     are two, each with its own gain. While one plays out the other is already
     coming up underneath it. They trade places on every handover. */
  var actx, master, booted = false;
  var decks = [], live = 0;
  var idx = 0, handing = false;

  function makeDeck() {
    var el = new Audio();
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    return { el: el, gain: null, src: null };
  }
  decks[0] = makeDeck();
  decks[1] = makeDeck();

  function boot() {
    if (booted) return true;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = 0;
      master.connect(actx.destination);
      for (var i = 0; i < 2; i++) {
        decks[i].gain = actx.createGain();
        decks[i].gain.gain.value = i === 0 ? 1 : 0;
        decks[i].src = actx.createMediaElementSource(decks[i].el);
        decks[i].src.connect(decks[i].gain);
        decks[i].gain.connect(master);
      }
      booted = true;
      return true;
    } catch (e) { return false; }
  }

  /* iOS ignores HTMLAudioElement.volume, so every level change goes through
     a GainNode instead. */
  function ramp(node, to, sec) {
    if (!node || !actx) return;
    var t = actx.currentTime;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(node.gain.value, t);
    node.gain.linearRampToValueAtTime(to, t + sec);
  }

  var playing = false, started = false;
  var unlocked = sessionStorage.getItem('io-audio-unlocked') === '1';
  var enabled  = sessionStorage.getItem('io-music-enabled') !== 'false';

  function handover() {
    if (handing) return;
    handing = true;
    var from = decks[live], to = decks[1 - live];
    idx = (idx + 1) % TRACKS.length;
    to.el.src = 'assets/audio/' + TRACKS[idx];
    to.el.currentTime = 0;
    to.el.play().then(function () {
      ramp(to.gain, 1, XFADE);
      ramp(from.gain, 0, XFADE);
      live = 1 - live;
      setTimeout(function () {
        try { from.el.pause(); } catch (e) {}
        handing = false;
      }, XFADE * 1000 + 200);
    }).catch(function () { handing = false; });
  }

  /* Watch the playhead rather than waiting for 'ended', because by the time
     a track has ended there is nothing left to fade out of. */
  setInterval(function () {
    if (!playing || !enabled || handing || parked || document.hidden) return;
    var el = decks[live].el;
    if (!el.duration || isNaN(el.duration)) return;
    if (el.duration - el.currentTime <= XLEAD) handover();
  }, 500);

  function start() {
    if (started || !enabled || REDUCED) return;
    started = true;
    if (!boot()) { started = false; return; }
    master.gain.setValueAtTime(0, actx.currentTime);
    var d = decks[live];
    d.el.src = 'assets/audio/' + TRACKS[idx];

    function go() {
      d.el.play().then(function () {
        playing = true;
        sessionStorage.setItem('io-music-playing', '1');
        ramp(master, BED_VOL, FADE_IN);
        paint();
        /* Say it once a session, once the bed is genuinely audible, so the
           dot reads as a control rather than a decoration. */
        if (!sessionStorage.getItem('io-music-hint')) {
          sessionStorage.setItem('io-music-hint', '1');
          setTimeout(function () { say('Music on', 2400); }, 900);
        }
      }).catch(function () { started = false; });
    }
    if (actx.state === 'suspended') actx.resume().then(go).catch(function () { started = false; });
    else go();
  }

  /* ---------------- BACKGROUND TABS ----------------
     A backgrounded tab gets its timers throttled while the media element
     keeps buffering. The browser then resamples to catch up, and that is the
     pitch and tempo warble you hear on coming back. Park the decks and the
     audio clock instead, then bring them up again on return. */
  var parked = false;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (!playing || parked) return;
      parked = true;
      ramp(master, 0, 0.3);
      setTimeout(function () {
        if (!document.hidden) return;
        for (var i = 0; i < 2; i++) { try { decks[i].el.pause(); } catch (e) {} }
        if (actx && actx.state === 'running') actx.suspend();
      }, 340);
    } else if (parked) {
      parked = false;
      if (!enabled) return;
      if (actx && actx.state === 'suspended') actx.resume();
      decks[live].el.play().catch(function () {});
      ramp(master, BED_VOL, 0.9);
    }
  });

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

  /* ---------------- TYPED LABEL ----------------
     Types itself in beside the dot, holds, then types itself back out. Each
     call takes a ticket; if a newer one arrives mid-word the older sequence
     sees a stale ticket and stops, so presses in quick succession never end
     up writing over each other. */
  var label = document.getElementById('music-label');
  var ticket = 0;

  function say(text, hold) {
    if (!label) return;
    var mine = ++ticket;
    label.classList.add('on');

    if (REDUCED) {
      label.textContent = text;
      setTimeout(function () {
        if (mine !== ticket) return;
        label.textContent = '';
        label.classList.remove('on');
      }, hold);
      return;
    }

    var IN = 54, OUT = 26;

    function erase(next) {
      if (mine !== ticket) return;
      var t = label.textContent;
      if (t.length) { label.textContent = t.slice(0, -1); setTimeout(function () { erase(next); }, OUT); return; }
      next();
    }

    erase(function write() {
      if (mine !== ticket) return;
      var n = label.textContent.length;
      if (n < text.length) {
        label.textContent = text.slice(0, n + 1);
        setTimeout(write, IN);
        return;
      }
      setTimeout(function () {
        erase(function () {
          if (mine !== ticket) return;
          label.classList.remove('on');
        });
      }, hold);
    });
  }

  /* ---------------- NAV TOGGLE ---------------- */
  var busy = false;

  function paint() {
    var btn = document.getElementById('music');
    if (!btn) return;
    var on = playing && enabled;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
  }

  /* Delegated, because the button is in the header and the header outlives
     every page swap, but this way it would survive one either way. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('#music');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    busy = true;
    /* Decide from whether anything is actually running, not from the stored
       preference. On a page where the bed never started, the first press has
       to turn it on even though the preference already says it is allowed. */
    enabled = !(started && enabled);
    sessionStorage.setItem('io-music-enabled', String(enabled));
    say(enabled ? 'Music on' : 'Music off', 1500);

    if (enabled) {
      if (!started) { start(); setTimeout(function () { busy = false; paint(); }, 1800); }
      else {
        if (actx && actx.state === 'suspended') actx.resume();
        decks[live].el.play().catch(function () {});
        ramp(master, BED_VOL, FADE_TOG);
        playing = true;
        sessionStorage.setItem('io-music-playing', '1');
        setTimeout(function () { busy = false; paint(); }, FADE_TOG * 1000 + 150);
      }
    } else {
      ramp(master, 0, FADE_TOG);
      setTimeout(function () {
        for (var i = 0; i < 2; i++) { try { decks[i].el.pause(); } catch (e) {} }
        playing = false;
        sessionStorage.setItem('io-music-playing', '0');
        busy = false; paint();
      }, FADE_TOG * 1000 + 150);
    }
    paint();
  });

  /* ---------------- WIRE IT UP ----------------
     Called again by the router after every page swap. */
  window.__IO.sound = function () {
    bind('.nav-links a, .foot-in a', 'tab');
    bind('.btn:not([data-sound])', 'tactile');
    bind('a.card, .tools .card', 'missions');
    bind('[data-sound="contact"]', 'contact');
    paint();
  };

  window.__IO.sound();
  if (unlocked && enabled && sessionStorage.getItem('io-music-playing') === '1') start();
})();
