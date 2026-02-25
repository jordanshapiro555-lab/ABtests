(function () {
  // ---------------------------
  // From your page HTML
  // ---------------------------
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  // New overlay
  var OVERLAY_ID = 'optly-savedbag-overlay';

  // Show once per session
  var SESSION_KEY = 'optly_savedbag_autoshow_v1';

  // Timing
  var POLL_MS = 100;
  var TIMEOUT_MS = 8000;

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function getQty() {
    var el = qs(headerQtySel);
    if (!el) return 0;
    var n = parseInt((el.textContent || '').trim(), 10);
    return isNaN(n) ? 0 : n;
  }

  function shouldShowOncePerSession() {
    try { return sessionStorage.getItem(SESSION_KEY) !== '1'; }
    catch (e) { return true; }
  }

  function markShownThisSession() {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
  }

  function ensureOverlayShell() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;

    var wrap = document.createElement('div');
    wrap.id = OVERLAY_ID;
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');

    wrap.innerHTML = [
      '<div class="optly-backdrop" data-optly-close></div>',
      '<div class="optly-drawer">',
        '<div class="optly-header">',
          '<p class="optly-title" id="optly-savedbag-title">We Saved Your Bag! (' + getQty() + ')</p>',
          '<button class="optly-close" type="button" aria-label="Close" data-optly-close>&times;</button>',
        '</div>',
        '<div class="optly-body" id="optly-savedbag-body">',
          '<div style="padding:14px 16px; font-size:12px; opacity:.85;">Loading your saved bag…</div>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(wrap);

    // Close interactions
    wrap.addEventListener('click', function (e) {
      var close = e.target && (e.target.hasAttribute('data-optly-close') || e.target.closest('[data-optly-close]'));
      if (close) closeOverlay();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
    });

    return wrap;
  }

  function openOverlay() {
    var wrap = ensureOverlayShell();
    var title = qs('#optly-savedbag-title', wrap);
    if (title) title.textContent = 'We Saved Your Bag! (' + getQty() + ')';
    wrap.classList.add('optly-open');
  }

  function closeOverlay() {
    var wrap = document.getElementById(OVERLAY_ID);
    if (wrap) wrap.classList.remove('optly-open');
  }

  function populateWithFullMinicartHtml() {
    var trigger = qs(triggerSel);
    if (!trigger) return;

    var url = trigger.getAttribute(actionUrlAttr);
    if (!url) return;

    fetch(url, { credentials: 'include' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var wrap = ensureOverlayShell();
        var body = qs('#optly-savedbag-body', wrap);
        if (!body) return;

        // Parse server HTML in-memory
        var tmp = document.createElement('div');
        tmp.innerHTML = html;

        /**
         * CRITICAL: Preserve ALL data-attrs and DOM structure by injecting the
         * returned overlay content wholesale (NOT re-mapping fields).
         *
         * Depending on SFRA implementation, the response may:
         * - Be the overlay inner HTML, OR
         * - Contain a node with [data-minicart-component="overlay"]
         */
        var overlayNode =
          tmp.querySelector('[data-minicart-component="overlay"]') ||
          tmp.querySelector('.header__minicart-overlay') ||
          tmp;

        // Inject as-is
        body.innerHTML = '';
        // Move nodes (preserves attributes). If your site expects scripts, they likely
        // already exist globally; we intentionally do NOT execute new scripts.
        while (overlayNode.firstChild) body.appendChild(overlayNode.firstChild);

        // Optional: if any links/buttons rely on delegated events, they'll still work.
        // If they rely on one-time binding to the original overlay only, we'd need to
        // re-trigger that initializer (site-specific).
      })
      .catch(function () {
        // If fetch fails, keep shell visible but do nothing else
      });
  }

  function initAutoShow() {
    // Optimizely audience controls who runs this JS.
    // From your requirement: show on load only once per session.
    if (!shouldShowOncePerSession()) return;
    if (getQty() <= 0) return;

    // Mark immediately so it never shows again this session
    markShownThisSession();

    // Open + populate
    openOverlay();
    populateWithFullMinicartHtml();
  }

  // Wait until qty badge exists (and trigger exists so we have data-action-url)
  var start = Date.now();
  (function tick() {
    var qtyEl = qs(headerQtySel);
    var triggerEl = qs(triggerSel);

    if (qtyEl && triggerEl) {
      initAutoShow();
      return;
    }

    if (Date.now() - start < TIMEOUT_MS) setTimeout(tick, POLL_MS);
  })();
})();
