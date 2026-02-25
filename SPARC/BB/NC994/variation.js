(function () {
  try {
    var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
    var triggerSel = '[data-minicart-component="trigger"]';
    var actionUrlAttr = 'data-action-url';

    var OVERLAY_ID = 'optly-savedbag-overlay';
    var SESSION_KEY = 'optly_savedbag_autoshow_v3';

    var POLL_MS = 100;
    var TIMEOUT_MS = 8000;

    var listenersBound = false;

    function qs(sel, root) { return (root || document).querySelector(sel); }

    function onReady(fn) {
      // Optimizely can run before <body> exists
      if (document.body) return fn();
      var start = Date.now();
      (function waitBody() {
        if (document.body) return fn();
        if (Date.now() - start > TIMEOUT_MS) return; // fail silently
        setTimeout(waitBody, 25);
      })();
    }

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

      // Body is guaranteed by onReady()
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
      if (!wrap) return;
      wrap.classList.remove('optly-open');
      var panel = wrap.querySelector('.optly-panel');
      if (panel) panel.classList.remove('optly-panel-in');
    }

    function positionPanelUnderCart(panelEl) {
      var trigger = qs(triggerSel);
      if (!trigger || !panelEl) return;

      var r = trigger.getBoundingClientRect();

      var GAP = 10;
      var PAD = 12;

      var panelRect = panelEl.getBoundingClientRect();
      var panelW = panelRect.width || Math.min(440, window.innerWidth - PAD * 2);

      var left = (r.left + r.width / 2) - (panelW / 2);
      left = Math.max(PAD, Math.min(left, window.innerWidth - panelW - PAD));

      var top = r.bottom + GAP;

      var maxH = Math.floor(window.innerHeight * 0.75);
      var estimatedPanelH = panelEl.scrollHeight || 300;

      // Flip up if needed
      if (top + Math.min(estimatedPanelH, maxH) > window.innerHeight - PAD) {
        top = Math.max(PAD, r.top - GAP - Math.min(estimatedPanelH, maxH));
      }

      panelEl.style.left = left + 'px';
      panelEl.style.top = top + 'px';

      // CARET logic (your requested snippet)
      var triggerCenterX = r.left + (r.width / 2);
      var caretXWithinPanel = triggerCenterX - left;

      var CARET_PAD = 18;
      caretXWithinPanel = Math.max(CARET_PAD, Math.min(caretXWithinPanel, panelW - CARET_PAD));

      panelEl.style.setProperty('--optly-caret-left', caretXWithinPanel + 'px');

      var flippedUp = top < r.top;
      panelEl.classList.toggle('optly-caret-bottom', flippedUp);
    }

    function stripDuplicateHeader(root) {
      // Remove the native minicart header so we don't have two headers
      var hdr = root.querySelector('.utility-overlay__header');
      if (hdr && hdr.parentNode) hdr.parentNode.removeChild(hdr);
    }

    function removeScripts(root) {
      // Keep PayPal/ApplePay markup; remove only <script> tags to avoid execution
      var scripts = root.querySelectorAll('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i] && scripts[i].parentNode) scripts[i].parentNode.removeChild(scripts[i]);
      }
    }

    function enforceScrollOnlyOnLineItems(panelEl) {
      if (!panelEl) return;

      var maxPanel = Math.floor(window.innerHeight * 0.75);

      var header = panelEl.querySelector('.optly-header');
      var body = panelEl.querySelector('#optly-savedbag-body');
      if (!header || !body) return;

      var lineItems = body.querySelector('.utility-overlay__line-items');
      var footer = body.querySelector('.utility-overlay__footer');
      if (!lineItems) return;

      // Make sure footer is never cut off; only line-items scroll
      lineItems.style.maxHeight = '';
      lineItems.style.overflow = 'auto';

      var headerH = header.getBoundingClientRect().height;
      var footerH = footer ? footer.getBoundingClientRect().height : 0;

      var available = maxPanel - headerH - footerH;
      if (available < 160) available = 160;

      if (panelEl.scrollHeight > maxPanel) {
        lineItems.style.maxHeight = available + 'px';
      } else {
        lineItems.style.maxHeight = '';
      }
    }

    function fadeInPanelAfterInject(panel) {
      if (!panel) return;
      panel.classList.remove('optly-panel-in');

      requestAnimationFrame(function () {
        positionPanelUnderCart(panel);
        enforceScrollOnlyOnLineItems(panel);

        requestAnimationFrame(function () {
          panel.classList.add('optly-panel-in');
        });
      });
    }

    function openOverlayShellOnly() {
      var wrap = ensureShell();
      var panel = wrap.querySelector('.optly-panel');

      var title = qs('#optly-savedbag-title', wrap);
      if (title) title.textContent = 'We Saved Your Bag! (' + getQty() + ')';

      if (panel) panel.classList.remove('optly-panel-in');

      wrap.classList.add('optly-open');

      requestAnimationFrame(function () {
        positionPanelUnderCart(panel);
      });
    }

    function bindReflowListenersOnce(wrap, panel) {
      if (listenersBound) return;
      listenersBound = true;

      var onReflow = function () {
        if (!wrap || !panel) return;
        if (!wrap.classList.contains('optly-open')) return;
        positionPanelUnderCart(panel);
        enforceScrollOnlyOnLineItems(panel);
      };

      window.addEventListener('resize', onReflow);
      window.addEventListener('scroll', onReflow, true);
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

          var overlayNode =
            tmp.querySelector('[data-minicart-component="overlay"]') ||
            tmp.querySelector('.header__minicart-overlay') ||
            tmp;

          removeScripts(overlayNode);
          stripDuplicateHeader(overlayNode);

          // Inject as-is (preserves PayPal DOM + all data-* values)
          body.innerHTML = '';
          while (overlayNode.firstChild) body.appendChild(overlayNode.firstChild);

          bindReflowListenersOnce(wrap, panel);

          // Fade in only after injection + measurement
          fadeInPanelAfterInject(panel);
        })
        .catch(function () {
          // fail silently; do not break page
          var wrap = ensureShell();
          var panel = wrap.querySelector('.optly-panel');
          if (panel) fadeInPanelAfterInject(panel);
        });
    }

    function initAutoShow() {
      if (!shouldShowOncePerSession()) return;
      if (getQty() <= 0) return;

      markShownThisSession();
      openOverlayShellOnly();
      populateWithFullMinicartHtml();
    }

    function waitForQtyAndTriggerThenInit() {
      var start = Date.now();
      (function tick() {
        if (qs(headerQtySel) && qs(triggerSel)) {
          initAutoShow();
          return;
        }
        if (Date.now() - start < TIMEOUT_MS) setTimeout(tick, POLL_MS);
      })();
    }

    onReady(waitForQtyAndTriggerThenInit);
  } catch (e) {
    // Never let an experiment take down the page
    try { console && console.warn && console.warn('Optimizely Saved Bag overlay error:', e); } catch (_) {}
  }
})();
