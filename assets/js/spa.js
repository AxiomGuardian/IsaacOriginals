/* ============================================================
   IsaacOriginals — SPA Navigation System
   Seamless page transitions. Audio never stops.
   Intercepts nav links, fetches content, crossfade swaps.
   ============================================================ */
(function () {
  'use strict';

  var TRANSITION_MS = 350;
  var pageCache = {};

  /* ── Identify internal nav links ── */
  function isInternalLink(a) {
    if (!a || !a.href) return false;
    if (a.target === '_blank') return false;
    if (a.href.indexOf('mailto:') === 0) return false;
    var url = new URL(a.href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname) return false;
    // Only intercept .html links or root
    if (url.pathname.match(/\.(html?)$/) || url.pathname === '/') return true;
    return false;
  }

  /* ── Fetch and parse page HTML ── */
  function fetchPage(url) {
    if (pageCache[url]) return Promise.resolve(pageCache[url]);
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('fetch failed');
      return res.text();
    }).then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var main = doc.getElementById('page-content');
      if (!main) throw new Error('no #page-content');
      var result = {
        html: main.innerHTML,
        page: main.getAttribute('data-page') || '',
        theme: main.getAttribute('data-theme') || '',
        title: doc.title || 'Isaac Originals'
      };
      pageCache[url] = result;
      return result;
    });
  }

  /* ── Swap content with crossfade ── */
  function navigateTo(url, pushState) {
    var content = document.getElementById('page-content');
    if (!content) {
      // Fallback: no SPA wrapper, do normal navigation
      window.location.href = url;
      return;
    }

    // Fade out
    content.classList.add('spa-out');

    fetchPage(url).then(function (data) {
      setTimeout(function () {
        // Swap content
        content.innerHTML = data.html;
        content.setAttribute('data-page', data.page);
        content.setAttribute('data-theme', data.theme);

        // Update document title
        document.title = data.title;

        // Update body theme class
        document.body.classList.remove('kit-theme', 'apex-theme');
        if (data.theme) document.body.classList.add(data.theme);

        // Update URL
        if (pushState !== false) {
          history.pushState({ url: url }, '', url);
        }

        // Scroll to top
        window.scrollTo(0, 0);

        // Update active nav link
        updateActiveNav(url);

        // Re-init page systems
        reinitPage(data.page);

        // Fade in
        content.classList.remove('spa-out');
      }, TRANSITION_MS);
    }).catch(function () {
      // SPA failed — fall back to normal navigation
      window.location.href = url;
    });
  }

  /* ── Update active nav link ── */
  function updateActiveNav(url) {
    var path = url.split('/').pop() || 'index.html';
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

  /* ── Re-initialise page systems after swap ── */
  function reinitPage(page) {
    // Re-init reveal animations
    if (window.__IO && window.__IO.initReveals) {
      window.__IO.initReveals();
    }

    // Re-init sound event listeners
    if (window.__IO && window.__IO.initSounds) {
      window.__IO.initSounds();
    }

    // Handle particles (only on index)
    if (page === 'index') {
      if (window.__IO && window.__IO.initParticles) {
        window.__IO.initParticles();
      }
      // Run hero sequence
      if (window.__IO && window.__IO.initHero) {
        window.__IO.initHero();
      }
    } else {
      if (window.__IO && window.__IO.destroyParticles) {
        window.__IO.destroyParticles();
      }
    }

    // Year stamp
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Re-attach SPA listeners to new content links
    attachLinkListeners();
  }

  /* ── Attach click listeners to internal links ── */
  function attachLinkListeners() {
    document.querySelectorAll('a').forEach(function (a) {
      if (a.__spa) return; // already attached
      if (!isInternalLink(a)) return;
      a.__spa = true;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        navigateTo(a.href, true);
      });
    });
  }

  /* ── Handle browser back/forward ── */
  window.addEventListener('popstate', function (e) {
    var url = window.location.href;
    navigateTo(url, false);
  });

  /* ── Initialise ── */
  // Store initial state
  history.replaceState({ url: window.location.href }, '', window.location.href);
  // Attach listeners to existing links
  attachLinkListeners();

  // Also intercept nav links in header (they persist across swaps)
  document.querySelectorAll('.glass-nav a, #mobile-menu a').forEach(function (a) {
    if (!isInternalLink(a)) return;
    a.__spa = true;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      // Close mobile menu if open
      var menu = document.getElementById('mobile-menu');
      if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        var btn = document.getElementById('menu-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        var iconOpen = document.getElementById('icon-open');
        var iconClose = document.getElementById('icon-close');
        if (iconOpen) iconOpen.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
      }
      navigateTo(a.href, true);
    });
  });

})();
