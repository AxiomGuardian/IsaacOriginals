/* ==========================================================================
   Isaac Originals — soft navigation
   A normal link tears the whole document down, which kills the music and
   starts it over from the first track. So same-site links fetch the next
   page, swap <main>, and leave the header, the footer and every running
   sound exactly where they were.

   If the fetch fails, the link is left alone and the browser navigates the
   ordinary way. That covers opening the pages straight off disk, where the
   browser refuses to fetch neighbouring files.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.fetch || !window.history || !window.history.pushState) return;

  var main = document.querySelector('main');
  if (!main) return;
  var busy = false;

  function samePage(href) {
    return href.split('#')[0] === location.href.split('#')[0];
  }

  function internal(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    if (a.origin !== location.origin) return false;
    return /\.html?$/.test(a.pathname) || a.pathname === '/' || a.pathname.slice(-1) === '/';
  }

  function markNav(url) {
    var file = url.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav-links a');
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      var lf = l.getAttribute('href');
      if (lf && lf.indexOf('http') !== 0 && lf.split('/').pop() === file) l.setAttribute('aria-current', 'page');
      else l.removeAttribute('aria-current');
    }
  }

  function swap(html, url, hash) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var next = doc.querySelector('main');
    if (!next) { location.href = url.href; return; }

    document.title = doc.title || document.title;
    /* Keep the loader's scroll lock out of this: it belongs to the document,
       not to the page being swapped in. */
    var wasLoading = document.body.classList.contains('loading');
    if (doc.body.className !== document.body.className) document.body.className = doc.body.className;
    if (wasLoading) document.body.classList.add('loading');

    /* Belt and braces. Page specific rules belong in site.css, but if a page
       ever carries its own <style> again, bring it along rather than silently
       arriving without it. */
    var styles = doc.head.querySelectorAll('style');
    for (var i = 0; i < styles.length; i++) {
      var css = styles[i].textContent;
      if (!css || document.__pageCss === css) continue;
      var tag = document.getElementById('page-css');
      if (!tag) {
        tag = document.createElement('style');
        tag.id = 'page-css';
        document.head.appendChild(tag);
      }
      tag.textContent = css;
      document.__pageCss = css;
    }
    if (!styles.length) {
      var stale = document.getElementById('page-css');
      if (stale) { stale.remove(); document.__pageCss = null; }
    }
    main.replaceWith(next);
    main = next;

    markNav(url);
    if (window.__IO && window.__IO.page)  window.__IO.page();
    if (window.__IO && window.__IO.sound) window.__IO.sound();
    if (window.__IO && window.__IO.i18n)  window.__IO.i18n();

    if (hash) {
      var t = document.getElementById(hash.slice(1));
      if (t) { t.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo(0, 0);
  }

  function go(url, push) {
    if (busy) return;
    busy = true;
    fetch(url.href, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        if (push) history.pushState({ io: 1 }, '', url.href);
        swap(html, url, url.hash);
        busy = false;
      })
      .catch(function () { busy = false; location.href = url.href; });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!internal(a)) return;

    var url = new URL(a.href);

    /* An in-page jump such as #ventures never needs a fetch. */
    if (url.hash && samePage(a.href)) return;

    e.preventDefault();
    go(url, true);
  });

  addEventListener('popstate', function () {
    go(new URL(location.href), false);
  });

  /* Warm the other pages so a click swaps instantly. */
  addEventListener('load', function () {
    setTimeout(function () {
      var seen = {};
      var links = document.querySelectorAll('.nav-links a, .btn, a.card');
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        if (!internal(a) || seen[a.href] || samePage(a.href)) continue;
        seen[a.href] = 1;
        fetch(a.href, { credentials: 'same-origin' }).catch(function () {});
      }
    }, 1200);
  });
})();
