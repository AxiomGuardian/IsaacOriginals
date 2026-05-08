/* ============================================================
   IsaacOriginals — main.js
   Cinematic page loader, typing effects, parallax, reveals.
   ============================================================ */

(function () {
  'use strict';

  // --- Cinematic page loader ---
  const loader = document.getElementById('page-loader');
  if (loader) {
    const video = document.getElementById('loader-video');
    if (video) {
      // When video ends, hold for 1s then fade out loader
      video.addEventListener('ended', () => {
        setTimeout(() => {
          loader.classList.add('done');
          startHeroSequence();
        }, 1000);
      });
      // Fallback in case video fails to load — dismiss after 5s
      setTimeout(() => {
        if (!loader.classList.contains('done')) {
          loader.classList.add('done');
          startHeroSequence();
        }
      }, 5000);
    } else {
      // No video element — use static fallback timing
      setTimeout(() => {
        loader.classList.add('done');
        startHeroSequence();
      }, 2800);
    }
  } else {
    // No loader — start hero immediately
    startHeroSequence();
  }

  function startHeroSequence() {
    const heroElements = [
      'hero-eyebrow',
      'hero-line-1',
      'hero-line-2',
      'hero-desc',
      'hero-cta'
    ];

    let delay = 200;
    heroElements.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.classList.add('typed');
        }, delay);
        delay += 350;
      }
    });
  }

  // --- Mobile nav toggle ---
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isHidden = menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isHidden));
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle('hidden', !isHidden);
        iconClose.classList.toggle('hidden', isHidden);
      }
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        if (iconOpen && iconClose) {
          iconOpen.classList.remove('hidden');
          iconClose.classList.add('hidden');
        }
      });
    });
  }

  // --- Highlight active nav link ---
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.getAttribute('data-nav') === path) {
      link.classList.remove('text-ink/50');
      link.classList.add('text-ink');
      link.setAttribute('aria-current', 'page');
    }
  });

  // --- Hero banner parallax (mouse-driven) ---
  const heroBanner = document.getElementById('hero-banner');
  if (heroBanner) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      heroBanner.style.transform = `translate(${x * -8}px, ${y * -5}px) scale(1.05)`;
    });
  }

  // --- Enhanced reveal on scroll ---
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealObserver = ('IntersectionObserver' in window && !prefersReduced)
    ? new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const delay = e.target.dataset.revealDelay || 0;
            setTimeout(() => {
              e.target.classList.add('is-visible');
            }, parseInt(delay));
            revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    : null;

  document.querySelectorAll('.reveal').forEach((el) => {
    if (revealObserver) {
      if (!el.dataset.revealDelay) {
        const parent = el.parentElement;
        const siblings = parent ? parent.querySelectorAll('.reveal') : [];
        const sibIndex = Array.from(siblings).indexOf(el);
        if (sibIndex > 0) {
          el.dataset.revealDelay = sibIndex * 100;
        }
      }
      revealObserver.observe(el);
    } else {
      el.classList.add('is-visible');
    }
  });

  // --- Year stamp ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
