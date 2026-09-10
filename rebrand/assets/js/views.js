/* ==========================================================================
   Isaac Originals — view counter

   Counts one view per visitor per session, not per page load, so reloading
   or clicking around does not inflate the number.

   The key below is a publishable key and is meant to be public. The table
   itself is locked: row level security is on with no policies, so nothing can
   read or write it directly. The only way in is the two functions, which run
   as their owner and do exactly one thing each. Worst case somebody scripts
   the counter up, which costs a personal site nothing.
   ========================================================================== */
(function () {
  'use strict';

  var URL  = 'https://ogfhkfqomsuvtxasmsou.supabase.co/rest/v1/rpc/';
  var KEY  = 'sb_publishable_Gd3TpoPs5Mg26VVsGeshpQ_0WXOG4ap';
  var PATH = 'site';

  var el = document.getElementById('views');
  if (!el || !window.fetch) return;

  var num = el.querySelector('b');
  if (!num) return;

  function paint(n) {
    if (typeof n !== 'number' || !isFinite(n) || n < 0) return;
    try { sessionStorage.setItem('io-views', String(n)); } catch (e) {}
    num.textContent = n.toLocaleString();
    el.classList.add('on');
  }

  function call(fn) {
    return fetch(URL + fn, {
      method: 'POST',
      headers: {
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_path: PATH })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  /* Show the last known number straight away so the slot is never empty while
     the request is in flight. */
  try {
    var cached = parseInt(sessionStorage.getItem('io-views') || '', 10);
    if (!isNaN(cached)) paint(cached);
  } catch (e) {}

  var counted = false;
  try { counted = sessionStorage.getItem('io-view-counted') === '1'; } catch (e) {}

  if (counted) {
    call('io_get_views').then(paint).catch(function () {});
  } else {
    try { sessionStorage.setItem('io-view-counted', '1'); } catch (e) {}
    call('io_bump_view').then(paint).catch(function () {
      /* Offline, blocked, or opened straight off disk. The slot simply stays
         hidden rather than showing a zero that is not true. */
      try { sessionStorage.removeItem('io-view-counted'); } catch (e) {}
    });
  }
})();
