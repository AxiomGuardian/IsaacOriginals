/* ============================================================
   IsaacOriginals — i18n Language System v1
   ─ Loads translations from JSON
   ─ Swaps text via data-i18n attributes
   ─ Persists language choice in sessionStorage
   ─ Works with SPA navigation (re-applies on page swap)
   ─ Clean dropdown in nav bar
   ============================================================ */
(function () {
  'use strict';

  window.__IO = window.__IO || {};

  var STORAGE_KEY = 'io-lang';
  var DEFAULT_LANG = 'en';
  var translations = null;
  var currentLang = sessionStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  /* ── Load translations JSON ────────────────────────────── */
  function loadTranslations(cb) {
    if (translations) { cb(); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/assets/i18n/translations.json?v=1', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          translations = JSON.parse(xhr.responseText);
          cb();
        } catch (e) {
          console.warn('i18n: failed to parse translations');
        }
      }
    };
    xhr.send();
  }

  /* ── Apply translations to page ────────────────────────── */
  function applyLanguage(lang) {
    if (!translations || !translations[lang]) return;
    currentLang = lang;
    sessionStorage.setItem(STORAGE_KEY, lang);

    var dict = translations[lang];
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        var el = els[i];
        var hasLinks = el.querySelector('a');
        var hasSvg = el.querySelector('svg');

        if (hasLinks) {
          // Element has <a> links — use innerHTML so links stay clickable
          // But only if the translation is plain text (no HTML injection risk — we own the JSON)
          el.innerHTML = dict[key];
        } else if (hasSvg) {
          // Element has SVG child — replace only the text node, keep the SVG
          var nodes = el.childNodes;
          for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].nodeType === 3 && nodes[j].textContent.trim()) {
              nodes[j].textContent = dict[key] + ' ';
              break;
            }
          }
        } else {
          el.textContent = dict[key];
        }
      }
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update toggle button text
    var toggleText = document.getElementById('lang-current');
    if (toggleText) toggleText.textContent = lang.toUpperCase();
  }

  /* ── Create language switcher UI ───────────────────────── */
  function createSwitcher() {
    // Don't duplicate
    if (document.getElementById('lang-switcher')) return;

    var nav = document.querySelector('.glass-nav .max-w-6xl');
    if (!nav) return;

    // Container
    var wrap = document.createElement('div');
    wrap.id = 'lang-switcher';
    wrap.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);right:24px;z-index:52;';

    // If music toggle exists, shift lang switcher left
    var musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
      wrap.style.right = '66px';
    }

    // Toggle button
    var btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Change language');
    btn.setAttribute('data-sound', 'tactile');
    btn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.15);border-radius:4px;padding:4px 10px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:border-color 0.3s,background 0.3s;';

    var label = document.createElement('span');
    label.id = 'lang-current';
    label.style.cssText = 'font-size:12px;font-weight:500;letter-spacing:0.08em;color:rgba(255,255,255,0.55);transition:color 0.3s;';
    label.textContent = currentLang.toUpperCase();

    var arrow = document.createElement('span');
    arrow.style.cssText = 'font-size:8px;color:rgba(255,255,255,0.35);transition:transform 0.3s,color 0.3s;display:inline-block;';
    arrow.textContent = '▼';
    arrow.id = 'lang-arrow';

    btn.appendChild(label);
    btn.appendChild(arrow);

    // Dropdown
    var dropdown = document.createElement('div');
    dropdown.id = 'lang-dropdown';
    dropdown.style.cssText = 'position:absolute;top:calc(100% + 8px);right:0;min-width:120px;' +
      'background:rgba(17,17,17,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:6px;' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'padding:6px 0;opacity:0;visibility:hidden;transform:translateY(-4px);' +
      'transition:opacity 0.25s,visibility 0.25s,transform 0.25s;z-index:60;';

    var languages = [
      { code: 'en', label: 'English', flag: 'EN' },
      { code: 'es', label: 'Español', flag: 'ES' }
    ];

    languages.forEach(function (lang) {
      var opt = document.createElement('button');
      opt.setAttribute('data-lang', lang.code);
      opt.setAttribute('data-sound', 'tactile');
      opt.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:8px 14px;' +
        'background:none;border:none;cursor:pointer;text-align:left;transition:background 0.2s;';

      var flagSpan = document.createElement('span');
      flagSpan.style.cssText = 'font-size:11px;font-weight:600;letter-spacing:0.06em;color:rgba(255,255,255,0.4);min-width:22px;';
      flagSpan.textContent = lang.flag;

      var nameSpan = document.createElement('span');
      nameSpan.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.75);';
      nameSpan.textContent = lang.label;

      opt.appendChild(flagSpan);
      opt.appendChild(nameSpan);

      opt.addEventListener('mouseenter', function () {
        this.style.background = 'rgba(255,255,255,0.06)';
      });
      opt.addEventListener('mouseleave', function () {
        this.style.background = 'none';
      });

      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        var code = this.getAttribute('data-lang');
        applyLanguage(code);
        closeDropdown();
      });

      dropdown.appendChild(opt);
    });

    wrap.appendChild(btn);
    wrap.appendChild(dropdown);
    nav.style.position = 'relative';
    nav.appendChild(wrap);

    // Toggle dropdown
    var isOpen = false;

    function openDropdown() {
      isOpen = true;
      dropdown.style.opacity = '1';
      dropdown.style.visibility = 'visible';
      dropdown.style.transform = 'translateY(0)';
      arrow.style.transform = 'rotate(180deg)';
      btn.style.borderColor = 'rgba(255,255,255,0.3)';
      label.style.color = 'rgba(255,255,255,0.85)';
      arrow.style.color = 'rgba(255,255,255,0.6)';
    }

    function closeDropdown() {
      isOpen = false;
      dropdown.style.opacity = '0';
      dropdown.style.visibility = 'hidden';
      dropdown.style.transform = 'translateY(-4px)';
      arrow.style.transform = 'rotate(0deg)';
      btn.style.borderColor = 'rgba(255,255,255,0.15)';
      label.style.color = 'rgba(255,255,255,0.55)';
      arrow.style.color = 'rgba(255,255,255,0.35)';
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isOpen) closeDropdown();
      else openDropdown();
    });

    // Hover states on button
    btn.addEventListener('mouseenter', function () {
      if (!isOpen) {
        btn.style.borderColor = 'rgba(255,255,255,0.25)';
        label.style.color = 'rgba(255,255,255,0.75)';
      }
    });
    btn.addEventListener('mouseleave', function () {
      if (!isOpen) {
        btn.style.borderColor = 'rgba(255,255,255,0.15)';
        label.style.color = 'rgba(255,255,255,0.55)';
      }
    });

    // Close on outside click
    document.addEventListener('click', function () {
      if (isOpen) closeDropdown();
    });
  }

  /* ── Mobile responsive style ───────────────────────────── */
  var mobileStyle = document.createElement('style');
  mobileStyle.textContent =
    '@media(max-width:767px){' +
      '#lang-switcher{right:auto!important;left:auto;position:relative!important;' +
      'transform:none!important;top:auto!important;margin-right:8px;}' +
      '.glass-nav .max-w-6xl{position:relative;}' +
    '}';
  document.head.appendChild(mobileStyle);

  /* ── Expose for SPA ────────────────────────────────────── */
  window.__IO.applyLanguage = function () {
    if (translations) {
      applyLanguage(currentLang);
    }
  };

  window.__IO.initI18n = function () {
    createSwitcher();
    if (translations) applyLanguage(currentLang);
  };

  /* ── Boot ──────────────────────────────────────────────── */
  loadTranslations(function () {
    createSwitcher();
    applyLanguage(currentLang);
  });

})();
