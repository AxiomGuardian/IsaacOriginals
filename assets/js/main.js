/* ============================================================
   IsaacOriginals — main.js v5
   Loader, welcome gate, hero sequence, reveals, parallax.
   Exposes __IO globals for SPA reinit.
   ============================================================ */

(function () {
  'use strict';

  // --- Global namespace for SPA reinit ---
  window.__IO = window.__IO || {};

  // --- Browser detection ---
  var ua = navigator.userAgent;
  var isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  var isChrome = /chrome/i.test(ua) && !/edg/i.test(ua);
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  var html = document.documentElement;
  if (isSafari) html.classList.add('browser-safari');
  if (isChrome) html.classList.add('browser-chrome');
  if (isIOS) html.classList.add('is-ios');
  if (isTouch) html.classList.add('is-touch');

  // --- Hero sequence ---
  function startHeroSequence() {
    var heroElements = ['hero-eyebrow', 'hero-line-1', 'hero-line-2', 'hero-desc', 'hero-cta'];
    var delay = 200;
    heroElements.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        setTimeout(function () { el.classList.add('typed'); }, delay);
        delay += 350;
      }
    });
  }

  // Expose for SPA
  window.__IO.initHero = startHeroSequence;

  // --- Cinematic loader + Welcome gate ---
  var loader = document.getElementById('page-loader');
  if (loader) {
    var alreadyPlayed = sessionStorage.getItem('io-loader-played');

    if (alreadyPlayed) {
      // Already played — skip instantly
      loader.style.transition = 'none';
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      loader.style.pointerEvents = 'none';
      loader.classList.add('done');
      startHeroSequence();
    } else {
      var video = document.getElementById('loader-video');
      var holdTime = isChrome ? 1800 : 1000;

      if (video) {
        video.addEventListener('ended', function () {
          setTimeout(function () {
            showWelcomeGate();
          }, holdTime);
        });
        // Fallback if video fails
        setTimeout(function () {
          if (!loader.classList.contains('done')) {
            showWelcomeGate();
          }
        }, 6000);
      } else {
        setTimeout(function () {
          showWelcomeGate();
        }, 2800);
      }
    }

    // bfcache handler
    window.addEventListener('pageshow', function (e) {
      if (e.persisted && loader) {
        loader.style.transition = 'none';
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.style.pointerEvents = 'none';
        loader.classList.add('done');
      }
    });
  } else {
    startHeroSequence();
  }

  // --- Welcome gate ---
  function showWelcomeGate() {
    var gate = document.getElementById('welcome-gate');
    if (gate) {
      gate.classList.add('visible');
    } else {
      // No welcome gate element — dismiss loader directly (non-index pages)
      dismissLoader();
    }
  }

  function dismissLoader() {
    if (loader && !loader.classList.contains('done')) {
      loader.classList.add('done');
      sessionStorage.setItem('io-loader-played', '1');
      startHeroSequence();
    }
  }

  // Welcome button click handler
  var welcomeBtn = document.getElementById('welcome-btn');
  if (welcomeBtn) {
    welcomeBtn.addEventListener('click', function () {
      dismissLoader();
    });
    if (isTouch) {
      welcomeBtn.addEventListener('touchstart', function () {
        dismissLoader();
      }, { passive: true });
    }
  }

  // --- Mobile nav toggle ---
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('icon-open');
  var iconClose = document.getElementById('icon-close');

  if (btn && menu) {
    btn.addEventListener('click', function () {
      var isHidden = menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isHidden));
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle('hidden', !isHidden);
        iconClose.classList.toggle('hidden', isHidden);
      }
    });
  }

  // --- Active nav link ---
  function updateNavHighlight() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      link.classList.remove('text-ink');
      link.classList.add('text-ink/50');
      link.removeAttribute('aria-current');
      if (link.getAttribute('data-nav') === path) {
        link.classList.remove('text-ink/50');
        link.classList.add('text-ink');
        link.setAttribute('aria-current', 'page');
      }
    });
  }
  updateNavHighlight();

  // --- Hero parallax ---
  var heroBanner = document.getElementById('hero-banner');
  if (heroBanner) {
    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      heroBanner.style.transform = 'translate(' + (x * -8) + 'px, ' + (y * -5) + 'px) scale(1.05)';
    });
  }

  // --- Reveal on scroll ---
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealObserver = null;

  function initReveals() {
    var elements = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!elements.length) return;

    if ('IntersectionObserver' in window && !prefersReduced) {
      if (!revealObserver) {
        revealObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              var delay = e.target.dataset.revealDelay || 0;
              setTimeout(function () {
                e.target.classList.add('is-visible');
              }, parseInt(delay));
              revealObserver.unobserve(e.target);
            }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      }

      elements.forEach(function (el) {
        if (!el.dataset.revealDelay) {
          var parent = el.parentElement;
          var siblings = parent ? parent.querySelectorAll('.reveal') : [];
          var sibIndex = Array.from(siblings).indexOf(el);
          if (sibIndex > 0) el.dataset.revealDelay = sibIndex * 100;
        }
        revealObserver.observe(el);
      });
    } else {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  initReveals();
  window.__IO.initReveals = initReveals;

  // --- Year stamp ---
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
