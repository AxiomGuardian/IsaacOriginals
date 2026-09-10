/* ==========================================================================
   Isaac Originals — English and Spanish

   Every translatable string carries a data-i18n key and lives in
   assets/i18n/copy.json. Nothing is machine translated at runtime: the
   Spanish is written, not generated, so it keeps the same voice.

   Names stay in English on purpose. Omnis Connect, ApexAERA, K.I.T.,
   WisdomWatch, K.C.R.M., Nexus and N.I.A. are names, not words, and
   translating a name is how you lose a brand.

   The choice is remembered for the session and re-applied after every soft
   navigation, since those swap the article without reloading anything.
   ========================================================================== */
(function () {
  'use strict';

  window.__IO = window.__IO || {};

  var KEY  = 'io-lang';
  var LANGS = ['en', 'es'];
  var NAMES = { en: 'English', es: 'Español' };
  var dict = null;
  var lang = sessionStorage.getItem(KEY);

  if (LANGS.indexOf(lang) === -1) {
    /* First visit follows the browser, which is the whole point of having a
       Spanish version: the people who need it should not have to find a
       menu. */
    lang = (navigator.language || 'en').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }

  function t(key) {
    if (!dict || !dict[lang]) return null;
    var v = dict[lang][key];
    return (v === undefined || v === null) ? null : v;
  }

  function apply() {
    if (!dict) return;
    document.documentElement.setAttribute('lang', lang);

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var v = t(nodes[i].getAttribute('data-i18n'));
      if (v !== null) nodes[i].textContent = v;
    }
    var html = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < html.length; j++) {
      var h = t(html[j].getAttribute('data-i18n-html'));
      if (h !== null) html[j].innerHTML = h;
    }

    var body = document.body;
    var tk = body.getAttribute('data-i18n-title');
    if (tk && t(tk)) document.title = t(tk);
    var mk = body.getAttribute('data-i18n-meta');
    var meta = document.querySelector('meta[name="description"]');
    if (mk && meta && t(mk)) meta.setAttribute('content', t(mk));

    paintPicker();
    /* The music label writes itself, so it has to be told separately. */
    if (window.__IO.relabelMusic) window.__IO.relabelMusic();
  }

  /* ---------------- PICKER ---------------- */
  function paintPicker() {
    var code = document.getElementById('lang-code');
    if (code) code.textContent = lang.toUpperCase();
    var opts = document.querySelectorAll('#lang-menu button');
    for (var i = 0; i < opts.length; i++) {
      opts[i].setAttribute('aria-selected', opts[i].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
  }

  function buildPicker() {
    var wrap = document.getElementById('lang');
    if (!wrap || wrap.dataset.built) return;
    wrap.dataset.built = '1';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'lang-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span id="lang-code">EN</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';

    var menu = document.createElement('div');
    menu.id = 'lang-menu';
    menu.setAttribute('role', 'listbox');
    for (var i = 0; i < LANGS.length; i++) {
      (function (code) {
        var o = document.createElement('button');
        o.type = 'button';
        o.setAttribute('role', 'option');
        o.setAttribute('data-lang', code);
        o.innerHTML = '<i>' + code.toUpperCase() + '</i>' + NAMES[code];
        o.addEventListener('click', function (e) {
          e.stopPropagation();
          set(code);
          close();
        });
        menu.appendChild(o);
      })(LANGS[i]);
    }

    wrap.appendChild(btn);
    wrap.appendChild(menu);

    function open()  { wrap.classList.add('open');  btn.setAttribute('aria-expanded', 'true'); }
    function close() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.contains('open') ? close() : open();
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function set(next) {
    if (LANGS.indexOf(next) === -1 || next === lang) return;
    lang = next;
    sessionStorage.setItem(KEY, lang);
    apply();
  }

  /* ---------------- BOOT ---------------- */
  window.__IO.lang = function () { return lang; };
  window.__IO.t = t;
  window.__IO.i18n = function () { buildPicker(); apply(); };

  buildPicker();

  fetch('assets/i18n/copy.json')
    .then(function (r) { return r.json(); })
    .then(function (j) { dict = j; apply(); })
    .catch(function () {
      /* Opened straight off disk the fetch is blocked, so the page simply
         stays in the English that is already written into the markup. */
      var wrap = document.getElementById('lang');
      if (wrap) wrap.style.display = 'none';
    });
})();
