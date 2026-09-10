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

  /* The loader fires this under the video. Chrome allows it, Safari refuses
     and the promise simply rejects, which is fine: a cue that lands after the
     animation has finished is worse than no cue at all, so it is never
     retried on the Welcome press. */
  window.__IO.entrance = function () {
    var s = cues.entrance;
    if (!s) return;
    try { s.currentTime = 0; s.play().catch(function () {}); } catch (e) {}
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
      /* A phone call, an alarm or another app grabbing the audio session
         interrupts the context while the page is still on screen. Nothing
         fires visibilitychange for that, so listen to the context itself. */
      actx.onstatechange = function () {
        if (!playing || document.hidden) return;
        if (actx.state === 'interrupted' || actx.state === 'suspended') {
          parked = true;
          setTimeout(unpark, 250);
        }
      };
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

  /* Two things here are load bearing, and both were learned the hard way.

     One: nothing is latched until the audio is genuinely running. An earlier
     version set `started` before attempting playback, so the speculative try
     under the video marked the bed as started, Safari refused it, and the
     flag stayed set. The Welcome press then saw `started` and did nothing at
     all. A failed attempt has to leave no trace, or the retry can never
     happen.

     Two: play() is called synchronously, inside whatever gesture we are
     already in. Safari spends the user gesture the moment the handler
     yields, so a play() that waits for resume() to settle first arrives too
     late and is refused. Fire both, await neither. */
  var starting = false;

  function start() {
    if (playing || starting || !enabled || REDUCED) return;
    starting = true;
    if (!boot()) { starting = false; return; }

    var d = decks[live];
    if (!d.el.src) d.el.src = 'assets/audio/' + TRACKS[idx];

    if (actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }

    var pr;
    try { pr = d.el.play(); } catch (e) { starting = false; return; }
    if (!pr || !pr.then) { starting = false; return; }

    pr.then(function () {
      if (actx.state !== 'running') { try { actx.resume(); } catch (e) {} }
      /* A resolved play() is not proof of sound. Once an element is routed
         through a MediaElementSource, playback into a suspended context
         resolves happily and is silent. Confirm the clock is actually
         running before claiming the bed is on, otherwise the button would
         say Music on over silence and refuse to retry. */
      setTimeout(function () {
        if (actx.state !== 'running' || d.el.paused) { give_up(); return; }
        starting = false;
        started = true;
        playing = true;
        sessionStorage.setItem('io-music-playing', '1');
        /* The gain sat on a frozen clock while the context was suspended, so
           set the floor again now that time is moving. */
        try { master.gain.cancelScheduledValues(actx.currentTime); } catch (e) {}
        try { master.gain.setValueAtTime(0, actx.currentTime); } catch (e) {}
        ramp(master, BED_VOL, FADE_IN);
        paint();
        /* Say it once a session, once the bed is genuinely audible, so the
           dot reads as a control rather than a decoration. */
        if (!sessionStorage.getItem('io-music-hint')) {
          sessionStorage.setItem('io-music-hint', '1');
          setTimeout(function () { announce('music.on', 2400); }, 900);
        }
      }, 80);
    }).catch(give_up);

    /* Refused, or allowed but silent. Leave everything exactly as it was so
       the next gesture, Welcome or the dot, gets a clean attempt. */
    function give_up() {
      starting = false;
      try { d.el.pause(); } catch (e) {}
    }
  }

  /* ---------------- BACKGROUND TABS ----------------
     A backgrounded tab gets its timers throttled while the media element
     keeps buffering. The browser then resamples to catch up, and that is the
     pitch and tempo warble you hear on coming back. Park the decks and the
     audio clock instead, then bring them up again on return. */
  var parked = false, waking = 0;

  /* Hold the master at exactly zero, right now, on whatever clock we have. */
  function silence() {
    if (!actx || !master) return;
    try {
      var t = actx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(0, t);
    } catch (e) {}
  }

  function park() {
    if (!playing || parked) return;
    parked = true;
    waking++;                       /* cancels any wake still in flight */
    ramp(master, 0, 0.25);
    setTimeout(function () {
      if (!parked) return;
      for (var i = 0; i < 2; i++) { try { decks[i].el.pause(); } catch (e) {} }
      if (actx && actx.state === 'running') { try { actx.suspend(); } catch (e) {} }
    }, 280);
  }

  /* Coming back is where this used to fall apart. The old version scheduled
     the fade up against actx.currentTime while the context was still
     suspended, and a suspended clock does not advance. By the time iOS
     actually resumed, the whole ramp was already in the past, so the gain
     jumped straight to full and you heard the element's stale buffer at full
     volume. That is the distorted stab on returning to the app.

     So: pin the gain to zero, resume, wait for the context to genuinely
     report running, start the element, give it a beat to produce real
     samples, and only then fade up. */
  function unpark() {
    if (!parked) return;
    parked = false;
    if (!enabled || !actx || !playing) return;

    var mine = ++waking;
    silence();

    var tries = 0;
    (function rise() {
      if (mine !== waking || parked) return;

      var st = actx.state;
      /* iOS reports 'interrupted' rather than 'suspended' when another app
         takes the audio session, and it needs the same resume. */
      if (st === 'suspended' || st === 'interrupted') {
        try { actx.resume(); } catch (e) {}
      }
      if (actx.state !== 'running') {
        if (tries++ < 40) setTimeout(rise, 100);
        return;
      }

      var el = decks[live].el, pr;
      silence();
      try { pr = el.play(); } catch (e) { return; }

      function up() {
        setTimeout(function () {
          if (mine !== waking || parked || !playing) return;
          silence();
          ramp(master, BED_VOL, 0.9);
        }, 140);
      }
      if (pr && pr.then) pr.then(up).catch(function () {}); else up();
    })();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) park(); else unpark();
  });

  /* Closing the app and returning does not always come through
     visibilitychange on iOS, and a page restored from the back forward cache
     never fires it at all. These are the backstops. Both paths are guarded by
     the parked flag, so extra firings cost nothing. */
  addEventListener('pagehide', park);
  addEventListener('pageshow', function () { if (!document.hidden) unpark(); });
  addEventListener('blur', function () { if (document.hidden) park(); });
  addEventListener('focus', function () { if (!document.hidden) unpark(); });

  /* ---------------- FIRST GESTURE ----------------
     If that first gesture is the music button itself, the bed must not
     auto-start here: the button's own handler decides, and starting it first
     would leave the two fighting over the same press. */
  function primeCues() {
    for (var k in cues) {
      /* Never prime the entrance hit. Priming plays a clip at volume zero to
         get it past the browser's gate, and iOS ignores volume on a media
         element, so a four second cinematic cue would bleed out loud at the
         exact moment the curtain drops. It is fired directly by the loader
         and needs no priming. */
      if (k === 'entrance') continue;
      (function (s) {
        var v = s.volume; s.volume = 0;
        s.play().then(function () { s.pause(); s.currentTime = 0; s.volume = v; })
                .catch(function () { s.volume = v; });
      })(cues[k]);
    }
  }

  function unlock(e) {
    if (unlocked) return;
    unlocked = true;
    sessionStorage.setItem('io-audio-unlocked', '1');
    var t = e && e.target;
    var onBtn = t && t.closest && t.closest('#music');
    /* Bed first. A user gesture is spent quickly, and five silent cue
       elements ahead of it can use it up before the music ever gets asked. */
    if (enabled && !onBtn) start();
    primeCues();
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
  var lastSaid = null;

  /* The label is written by script, not markup, so it cannot carry a
     data-i18n key. It asks the dictionary directly and falls back to English
     if the dictionary has not landed yet. */
  function word(key) {
    var v = window.__IO.t && window.__IO.t(key);
    if (v) return v;
    return key === 'music.off' ? 'Music off' : 'Music on';
  }

  /* Called when the language changes, so a label sitting on screen updates
     rather than finishing its hold in the old language. */
  window.__IO.relabelMusic = function () {
    if (!label || !lastSaid || !label.classList.contains('on')) return;
    say(word(lastSaid), 1500);
  };

  /* Remembers which phrase is on screen so a language change can rewrite it. */
  function announce(key, hold) { lastSaid = key; say(word(key), hold); }

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
    enabled = !(playing && enabled);
    sessionStorage.setItem('io-music-enabled', String(enabled));
    announce(enabled ? 'music.on' : 'music.off', 1500);

    if (enabled) {
      if (!playing) { start(); setTimeout(function () { busy = false; paint(); }, 1800); }
      else {
        if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }
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

  /* The loader's way in. Called once under the video, where Chrome will take
     it, and again on the Welcome press, where Safari finally will. The second
     call is a no op if the first one worked. `quiet` marks the speculative
     attempt so a refusal there is not treated as the visitor saying no. */
  window.__IO.begin = function (quiet) {
    if (playing || starting) return;
    if (!enabled) return;
    if (!quiet) {
      unlocked = true;
      sessionStorage.setItem('io-audio-unlocked', '1');
      start();
      primeCues();
      return;
    }
    start();
  };

  window.__IO.sound();
  if (unlocked && enabled && sessionStorage.getItem('io-music-playing') === '1') start();
})();
