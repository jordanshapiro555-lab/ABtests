(function () {
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  var OVERLAY_ID = 'optly-savedbag-overlay';
  var SESSION_KEY = 'optly_savedbag_autoshow_v3';

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

  function ensureShell() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;

    var wrap = document.createElement('div');
    wrap.id = OVERLAY_ID;
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');

    wrap.innerHTML = [
      '<div class="optly-backdrop" data-optly-close></div>',
      '<div class="optly-panel" role="document">',
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

    // Close: X or backdrop
    wrap.addEventListener('click', function (e) {
      var close = e.target && (e.target.hasAttribute('data-optly-close') || e.target.closest('[data-optly-close]'));
      if (close) closeOverlay();
    });

    // Close: Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
    });

    return wrap;
  }

  function closeOverlay() {
    var wrap = document.getElementById(OVERLAY_ID);
    if (wrap) wrap.classList.remove('optly-open');
  }

  function positionPanelUnderCart(panelEl) {
    var trigger = qs(triggerSel);
    if (!trigger || !panelEl) return;

    var r = trigger.getBoundingClientRect();

    // Desired placement:
    // - below cart icon
    // - centered relative to icon
    // - clamped to viewport with padding
    var GAP = 10;
    var PAD = 12;

    var panelW = panelEl.getBoundingClientRect().width || Math.min(440, window.innerWidth - PAD * 2);

    var left = (r.left + r.width / 2) - (panelW / 2);
    left = Math.max(PAD, Math.min(left, window.innerWidth - panelW - PAD));

    var top = r.bottom + GAP;
    // If too close to bottom, flip upward
    var maxH = Math.floor(window.innerHeight * 0.75);
    var estimatedPanelH = panelEl.scrollHeight || 300;
    if (top + Math.min(estimatedPanelH, maxH) > window.innerHeight - PAD) {
      top = Math.max(PAD, r.top - GAP - Math.min(estimatedPanelH, maxH));
    }

    panelEl.style.left = left + 'px';
    panelEl.style.top = top + 'px';

    // ---- CARET ADDITION (requested) ----
    // caret position is relative to the panel's left edge
    var triggerCenterX = r.left + (r.width / 2);
    var caretXWithinPanel = triggerCenterX - left;

    // Clamp caret so it doesn't go off the rounded edge area
    var CARET_PAD = 18;
    caretXWithinPanel = Math.max(CARET_PAD, Math.min(caretXWithinPanel, panelW - CARET_PAD));

    panelEl.style.setProperty('--optly-caret-left', caretXWithinPanel + 'px');

    // If we flipped the panel above the icon, flip caret to bottom
    var flippedUp = top < r.top; // simple check based on your flip logic
    panelEl.classList.toggle('optly-caret-bottom', flippedUp);
    // ---- END CARET ADDITION ----
  }

  function stripDuplicateHeader(root) {
    var hdr = root.querySelector('.utility-overlay__header');
    if (hdr && hdr.parentNode) hdr.parentNode.removeChild(hdr);
  }

  function removeScripts(root) {
    var scripts = root.querySelectorAll('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
  }

  function enforceScrollOnlyOnLineItems(panelEl) {
    // Footer must never be cut off:
    // - panel is max 75vh
    // - line-items gets remaining height and scrolls if needed
    if (!panelEl) return;

    var maxPanel = Math.floor(window.innerHeight * 0.75);

    var header = panelEl.querySelector('.optly-header');
    var body = panelEl.querySelector('#optly-savedbag-body');
    if (!header || !body) return;

    var lineItems = body.querySelector('.utility-overlay__line-items');
    var footer = body.querySelector('.utility-overlay__footer');
    if (!lineItems) return;

    // Reset so we can measure natural heights
    lineItems.style.maxHeight = '';
    lineItems.style.overflow = 'auto';

    var headerH = header.getBoundingClientRect().height;
    var footerH = footer ? footer.getBoundingClientRect().height : 0;

    // Remaining space inside panel for line-items when clamped
    var available = maxPanel - headerH - footerH;

    // Guardrail so line-items is usable
    if (available < 160) available = 160;

    // Only clamp if panel content exceeds maxPanel
    if (panelEl.scrollHeight > maxPanel) {
      lineItems.style.maxHeight = available + 'px';
    } else {
      lineItems.style.maxHeight = ''; // natural height
    }
  }

  function openOverlay() {
    var wrap = ensureShell();
    var panel = wrap.querySelector('.optly-panel');

    var title = qs('#optly-savedbag-title', wrap);
    if (title) title.textContent = 'We Saved Your Bag! (' + getQty() + ')';

    wrap.classList.add('optly-open');

    // Initial position (panel exists even before data injection)
    setTimeout(function () {
      positionPanelUnderCart(panel);
    }, 0);
  }

  function populateWithFullMinicartHtml() {
    var trigger = qs(triggerSel);
    if (!trigger) return;

    var url = trigger.getAttribute(actionUrlAttr);
    if (!url) return;

    fetch(url, { credentials: 'include' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var wrap = ensureShell();
        var body = qs('#optly-savedbag-body', wrap);
        var panel = wrap.querySelector('.optly-panel');
        if (!body || !panel) return;

        var tmp = document.createElement('div');
        tmp.innerHTML = html;

        // Take overlay HTML from response (or fallback)
        var overlayNode =
          tmp.querySelector('[data-minicart-component="overlay"]') ||
          tmp.querySelector('.header__minicart-overlay') ||
          tmp;

        removeScripts(overlayNode);
        stripDuplicateHeader(overlayNode);

        // Inject as-is (preserves all data-* values & structure)
        body.innerHTML = '';
        while (overlayNode.firstChild) body.appendChild(overlayNode.firstChild);

        // After inject: position + scroll rules
        setTimeout(function () {
          positionPanelUnderCart(panel);
          enforceScrollOnlyOnLineItems(panel);
        }, 0);

        // Keep correct on resize/scroll
        var onReflow = function () {
          if (!wrap.classList.contains('optly-open')) return;
          positionPanelUnderCart(panel);
          enforceScrollOnlyOnLineItems(panel);
        };

        window.addEventListener('resize', onReflow);
        window.addEventListener('scroll', onReflow, true);
      })
      .catch(function () {});
  }

  function initAutoShow() {
    if (!shouldShowOncePerSession()) return;
    if (getQty() <= 0) return;

    markShownThisSession();
    openOverlay();
    populateWithFullMinicartHtml();
  }

  // Wait for qty + trigger so we can fetch correct endpoint
  var start = Date.now();
  (function tick() {
    if (qs(headerQtySel) && qs(triggerSel)) {
      initAutoShow();
      return;
    }
    if (Date.now() - start < TIMEOUT_MS) setTimeout(tick, POLL_MS);
  })();
})();
