(function () {
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  var OVERLAY_ID = 'optly-savedbag-overlay';
  var SESSION_KEY = 'optly_savedbag_autoshow_v5';

  // Confirmed SFRA remove endpoint (GET)
  var REMOVE_ENDPOINT =
    'https://www.brooksbrothers.com/on/demandware.store/Sites-brooksbrothers-Site/en_US/Cart-RemoveProductLineItem';

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function getQty() {
    var el = qs(headerQtySel);
    var n = el ? parseInt((el.textContent || '').trim(), 10) : 0;
    return isNaN(n) ? 0 : n;
  }

  function shown() { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } }
  function markShown() { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {} }

  function ensureCss() {
    if (document.getElementById('optly-savedbag-css')) return;
    var css = document.createElement('style');
    css.id = 'optly-savedbag-css';
    css.textContent = [
      '#'+OVERLAY_ID+'{position:fixed;inset:0;z-index:2147483647;display:none;}',
      '#'+OVERLAY_ID+'.optly-open{display:block;}',
      '#'+OVERLAY_ID+' .optly-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.15);}',

      '#'+OVERLAY_ID+' .optly-panel{position:absolute;width:min(440px,calc(100vw - 24px));background:#fff;',
      'border:1px solid #e6e6e6;border-radius:10px;box-shadow:0 16px 50px rgba(0,0,0,.18);',
      'opacity:0;transform:translateY(-6px);transition:opacity .22s ease,transform .22s ease;}',
      '#'+OVERLAY_ID+' .optly-panel.optly-in{opacity:1;transform:translateY(0);}',

      '#'+OVERLAY_ID+' .optly-panel:before{content:"";position:absolute;top:-10px;left:var(--optly-caret-left,40px);',
      'transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;',
      'border-bottom:10px solid #fff;filter:drop-shadow(0 -1px 0 #e6e6e6);}',
      '#'+OVERLAY_ID+' .optly-panel.optly-caret-bottom:before{top:auto;bottom:-10px;border-bottom:none;border-top:10px solid #fff;',
      'filter:drop-shadow(0 1px 0 #e6e6e6);}',

      '#'+OVERLAY_ID+' .optly-header{display:flex;align-items:center;justify-content:space-between;',
      'padding:12px 14px;border-bottom:1px solid #eee;}',
      '#'+OVERLAY_ID+' .optly-title{margin:0;font-size:14px;font-weight:600;color:#1f2a44;}',
      '#'+OVERLAY_ID+' .optly-close{border:0;background:transparent;font-size:22px;line-height:1;cursor:pointer;color:#1f2a44;}'
    ].join('');
    document.head.appendChild(css);
  }

  function ensureShell() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;

    ensureCss();

    var wrap = document.createElement('div');
    wrap.id = OVERLAY_ID;
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');

    wrap.innerHTML = [
      '<div class="optly-backdrop" data-optly-close></div>',
      '<div class="optly-panel" role="document">',
        '<div class="optly-header">',
          '<p class="optly-title" id="optly-savedbag-title">We Saved Your Bag! ('+getQty()+')</p>',
          '<button class="optly-close" type="button" aria-label="Close" data-optly-close>&times;</button>',
        '</div>',
        '<div class="optly-body" id="optly-savedbag-body">',
          '<div style="padding:14px 16px;font-size:12px;opacity:.85;">Loading your saved bag…</div>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(wrap);

    // Close: backdrop, X, Continue Shopping, any data-toggle-close
    wrap.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;

      if (t.closest('[data-optly-close], .minicart__continue, [data-toggle-close]')) {
        e.preventDefault();
        closeOverlay();
        return;
      }

      // Remove (make it work reliably in our cloned DOM)
      var removeBtn = t.closest('[data-line-item-component="remove-action"]');
      if (removeBtn) {
        e.preventDefault();
        var lineItem = removeBtn.closest('[data-cart-line-item][data-pid]');
        if (!lineItem) return;

        var pid = lineItem.getAttribute('data-pid') || '';
        var uuid = lineItem.getAttribute('data-cart-line-item') || '';
        if (!pid || !uuid) return;

        if (!window.confirm('Remove this item from your bag?')) return;

        removeLineItem(pid, uuid);
      }
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
    });

    return wrap;
  }

  function closeOverlay() {
    var wrap = document.getElementById(OVERLAY_ID);
    if (!wrap) return;
    wrap.classList.remove('optly-open');
    var panel = qs('.optly-panel', wrap);
    if (panel) panel.classList.remove('optly-in');
  }

  function position(panelEl) {
    var trigger = qs(triggerSel);
    if (!trigger || !panelEl) return;

    var r = trigger.getBoundingClientRect();
    var GAP = 10, PAD = 12;

    var panelW = panelEl.getBoundingClientRect().width || Math.min(440, window.innerWidth - PAD * 2);
    var left = (r.left + r.width / 2) - (panelW / 2);
    left = Math.max(PAD, Math.min(left, window.innerWidth - panelW - PAD));

    var top = r.bottom + GAP;

    var maxH = Math.floor(window.innerHeight * 0.75);
    var estH = panelEl.scrollHeight || 320;
    if (top + Math.min(estH, maxH) > window.innerHeight - PAD) {
      top = Math.max(PAD, r.top - GAP - Math.min(estH, maxH));
    }

    panelEl.style.left = left + 'px';
    panelEl.style.top = top + 'px';

    // caret
    var triggerCenterX = r.left + (r.width / 2);
    var caretX = triggerCenterX - left;
    var CARET_PAD = 18;
    caretX = Math.max(CARET_PAD, Math.min(caretX, panelW - CARET_PAD));
    panelEl.style.setProperty('--optly-caret-left', caretX + 'px');
    panelEl.classList.toggle('optly-caret-bottom', top < r.top);
  }

  function clampScroll(panelEl) {
    var maxPanel = Math.floor(window.innerHeight * 0.75);
    var header = qs('.optly-header', panelEl);
    var body = qs('#optly-savedbag-body', panelEl);
    if (!header || !body) return;

    var lineItems = qs('.utility-overlay__line-items', body);
    var footer = qs('.utility-overlay__footer', body);
    if (!lineItems) return;

    lineItems.style.overflow = 'auto';
    lineItems.style.maxHeight = '';

    if (panelEl.scrollHeight > maxPanel) {
      var headerH = header.getBoundingClientRect().height;
      var footerH = footer ? footer.getBoundingClientRect().height : 0;
      var avail = maxPanel - headerH - footerH;
      if (avail < 160) avail = 160;
      lineItems.style.maxHeight = avail + 'px';
    }
  }

  function stripDupHeader(node) {
    var h = node.querySelector('.utility-overlay__header');
    if (h && h.parentNode) h.parentNode.removeChild(h);
  }
  function removeScripts(node) {
    qsa('script', node).forEach(function (s) { s.parentNode && s.parentNode.removeChild(s); });
  }

  // ---- PayPal (best-effort, lazy) ----
  function safeJson(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  function loadScript(src, cb) {
    if (!src) return cb(false);
    if (window.paypal && window.paypal.Buttons) return cb(true);
    if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
      return setTimeout(function () { cb(!!(window.paypal && window.paypal.Buttons)); }, 300);
    }
    var sc = document.createElement('script');
    sc.async = true;
    sc.src = src;
    sc.onload = function () { cb(!!(window.paypal && window.paypal.Buttons)); };
    sc.onerror = function () { cb(false); };
    document.head.appendChild(sc);
  }

  function tryRenderPaypal(bodyRoot) {
    var paypalContent = bodyRoot.querySelector('.paypal-content[data-paypal-urls]');
    if (!paypalContent) return;

    var urls = safeJson(paypalContent.getAttribute('data-paypal-urls') || '');
    if (!urls || !urls.cartSdkUrl) return;

    var host = bodyRoot.querySelector('.js_paypal_button_on_cart_page') || bodyRoot.querySelector('.paypal-cart-button');
    if (!host || host.querySelector('iframe, .paypal-buttons')) return;

    loadScript(urls.cartSdkUrl, function (ok) {
      if (!ok) return;

      var cfgEl = bodyRoot.querySelector('.js_paypal_button_on_cart_page[data-paypal-button-config]');
      var cfg = cfgEl ? safeJson(cfgEl.getAttribute('data-paypal-button-config') || '') : null;
      var style = (cfg && cfg.style) ? cfg.style : { height: 35, layout: 'vertical', label: 'checkout', tagline: false };

      host.innerHTML = '';

      window.paypal.Buttons({
        style: style,
        createOrder: function () {
          var u = urls.getCartPurchaseUnit || urls.getPurchaseUnit;
          if (!u) return Promise.reject();
          return fetch(u, { credentials: 'include' })
            .then(function (r) { return r.json().catch(function () { return {}; }); })
            .then(function (j) {
              var id = j.id || j.orderID || j.orderId || (j.data && (j.data.id || j.data.orderID));
              return id ? id : Promise.reject();
            });
        },
        onApprove: function (data) {
          var token = data && (data.orderID || data.orderId);
          if (urls.returnFromCart && token) {
            window.location.href = urls.returnFromCart +
              (urls.returnFromCart.indexOf('?') === -1 ? '?' : '&') +
              'token=' + encodeURIComponent(token);
          } else if (urls.cartPage) {
            window.location.href = urls.cartPage;
          }
        }
      }).render(host);

      // Hide black fallback if present
      var legacy = bodyRoot.querySelector('button.button--paypal[aria-hidden="true"]');
      if (legacy) legacy.style.display = 'none';
    });
  }

  // ---- Data fetch + render ----
  function openOverlay() {
    var wrap = ensureShell();
    var panel = qs('.optly-panel', wrap);
    var title = qs('#optly-savedbag-title', wrap);
    if (title) title.textContent = 'We Saved Your Bag! (' + getQty() + ')';

    wrap.classList.add('optly-open');

    requestAnimationFrame(function () {
      position(panel);
      requestAnimationFrame(function () { panel && panel.classList.add('optly-in'); });
    });
  }

  function populate() {
    var trigger = qs(triggerSel);
    if (!trigger) return;
    var url = trigger.getAttribute(actionUrlAttr);
    if (!url) return;

    fetch(url, { credentials: 'include' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var wrap = ensureShell();
        var panel = qs('.optly-panel', wrap);
        var body = qs('#optly-savedbag-body', wrap);
        if (!panel || !body) return;

        var tmp = document.createElement('div');
        tmp.innerHTML = html;

        var overlayNode =
          tmp.querySelector('[data-minicart-component="overlay"]') ||
          tmp.querySelector('.header__minicart-overlay') ||
          tmp;

        removeScripts(overlayNode);
        stripDupHeader(overlayNode);

        body.innerHTML = '';
        while (overlayNode.firstChild) body.appendChild(overlayNode.firstChild);

        requestAnimationFrame(function () {
          position(panel);
          clampScroll(panel);
        });

        // PayPal: render after DOM inject
        setTimeout(function () { tryRenderPaypal(body); }, 0);
      })
      .catch(function () {});
  }

  function removeLineItem(pid, uuid) {
    var u = REMOVE_ENDPOINT +
      '?pid=' + encodeURIComponent(pid) +
      '&uuid=' + encodeURIComponent(uuid) +
      '&context=minicart&qty=1';

    fetch(u, { credentials: 'include' })
      .then(function () { populate(); })
      .catch(function () {});
  }

  function init() {
    if (shown()) return;
    if (getQty() <= 0) return;

    markShown();
    openOverlay();
    populate();

    // light reflow
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var wrap = document.getElementById(OVERLAY_ID);
        if (!wrap || !wrap.classList.contains('optly-open')) return;
        var panel = qs('.optly-panel', wrap);
        position(panel);
        clampScroll(panel);
      }, 80);
    });
    window.addEventListener('scroll', function () {
      var wrap = document.getElementById(OVERLAY_ID);
      if (!wrap || !wrap.classList.contains('optly-open')) return;
      position(qs('.optly-panel', wrap));
    }, true);
  }

  // Wait for trigger + qty (no page-load blocking)
  var start = Date.now();
  (function tick() {
    if (qs(headerQtySel) && qs(triggerSel)) return init();
    if (Date.now() - start > 8000) return;
    setTimeout(tick, 120);
  })();
})();
