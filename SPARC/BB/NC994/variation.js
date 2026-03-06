(function () {
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  var OVERLAY_ID = 'optly-savedbag-overlay';
  var SESSION_KEY = 'optly_savedbag_autoshow_v6';

  var REMOVE_ENDPOINT =
    'https://www.brooksbrothers.com/on/demandware.store/Sites-brooksbrothers-Site/en_US/Cart-RemoveProductLineItem';

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function getQty() {
    var el = qs(headerQtySel);
    var n = el ? parseInt((el.textContent || '').trim(), 10) : 0;
    return isNaN(n) ? 0 : n;
  }

  function shown() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; }
    catch (e) { return false; }
  }

  function markShown() {
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
          '<div class="optly-header-left">',
            '<span class="optly-check" aria-hidden="true">',
              '<svg viewBox="0 0 20 20" width="20" height="20" focusable="false" aria-hidden="true">',
                '<circle cx="10" cy="10" r="10" fill="#1f9d55"></circle>',
                '<path d="M8.4 13.8 5.4 10.8l1.1-1.1 1.9 1.9 5-5 1.1 1.1z" fill="#fff"></path>',
              '</svg>',
            '</span>',
            '<p class="optly-title" id="optly-savedbag-title">Added to Bag</p>',
          '</div>',
          '<button class="optly-close" type="button" aria-label="Close" data-optly-close>&times;</button>',
        '</div>',
        '<div class="optly-body" id="optly-savedbag-body">',
          '<div style="padding:14px 16px;font-size:12px;opacity:.85;">Loading your saved bag…</div>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;

      if (t.closest('[data-optly-close], .minicart__continue, [data-toggle-close]')) {
        e.preventDefault();
        closeOverlay();
        return;
      }

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
    if (panel) panel.classList.remove('optly-panel-in');
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

    var maxH = Math.floor(window.innerHeight * 0.60);
    var estH = panelEl.scrollHeight || 320;
    if (top + Math.min(estH, maxH) > window.innerHeight - PAD) {
      top = Math.max(PAD, r.top - GAP - Math.min(estH, maxH));
    }

    panelEl.style.left = left + 'px';
    panelEl.style.top = top + 'px';

    var triggerCenterX = r.left + (r.width / 2);
    var caretX = triggerCenterX - left;
    var CARET_PAD = 18;
    caretX = Math.max(CARET_PAD, Math.min(caretX, panelW - CARET_PAD));
    panelEl.style.setProperty('--optly-caret-left', caretX + 'px');
    panelEl.classList.toggle('optly-caret-bottom', top < r.top);
  }

  function clampScroll(panelEl) {
    var maxPanel = Math.floor(window.innerHeight * 0.60);
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
      if (avail < 120) avail = 120;
      lineItems.style.maxHeight = avail + 'px';
    }
  }

  function stripDupHeader(node) {
    var h = node.querySelector('.utility-overlay__header');
    if (h && h.parentNode) h.parentNode.removeChild(h);
  }

  function removeScripts(node) {
    qsa('script', node).forEach(function (s) {
      if (s.parentNode) s.parentNode.removeChild(s);
    });
  }

  function customizeInjectedMarkup(body) {
    // 1) Remove quantity row
    qsa('.product-line-item__qty-pricing .product-line-item__quantity', body).forEach(function (el) {
      el.remove();
    });

    // Also remove any standalone qty labels if structure differs
    qsa('.line-item-pricing-info', body).forEach(function (el) {
      var txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (txt.indexOf('qty:') === 0) {
        var quantityWrap = el.closest('.product-line-item__quantity');
        if (quantityWrap) quantityWrap.remove();
      }
    });

    // 2) Remove PayPal button/module
    qsa('.minicart-paypal-button, .checkout-express__button, .paypal-content, .paypal-cart-button, .js_paypal_button_on_cart_page, .button--paypal', body).forEach(function (el) {
      el.remove();
    });

    // 3) Remove Apple Pay too if present inside CTA area
    qsa('[data-cart-component="disable-express-payments"], isapplepay, #apple-pay-button', body).forEach(function (el) {
      el.remove();
    });

    // 4) Remove hyperlinks user doesn't want
    qsa('.minicart__continue, a[title="View Shopping Bag"], .utility-overlay__footer-actions .link.link--primary.link--underline', body).forEach(function (el) {
      el.remove();
    });

    // 5) Convert CTA labels/order to match requested screenshot
    var checkoutBtn = qs('[data-cart-component="checkout-action"], .checkout-btn', body);
    if (checkoutBtn) {
      checkoutBtn.textContent = 'VIEW BAG';
      checkoutBtn.classList.add('optly-view-bag-btn');
      // Route VIEW BAG to cart page if a cart URL exists
      var cartLink = qs('a[href*="Cart-Show"], a[href*="/cart"]', body);
      if (cartLink && cartLink.href && checkoutBtn.tagName.toLowerCase() === 'a') {
        checkoutBtn.href = cartLink.href;
      }
    }

    // Add CHECKOUT NOW button if missing
    var footerActions = qs('.utility-overlay__footer-actions', body);
    if (footerActions) {
      var existingCheckoutNow = qs('.optly-checkout-now-btn', footerActions);
      if (!existingCheckoutNow) {
        var sourceCheckout = qs('[data-cart-component="checkout-action"], .checkout-btn', body);
        var checkoutHref = sourceCheckout && sourceCheckout.tagName.toLowerCase() === 'a' ? sourceCheckout.href : '';
        var btn = document.createElement('a');
        btn.className = 'button optly-checkout-now-btn';
        btn.textContent = 'CHECKOUT NOW';
        if (checkoutHref) btn.href = checkoutHref;
        footerActions.appendChild(btn);
      }
    }
  }

  function openOverlay() {
    var wrap = ensureShell();
    var panel = qs('.optly-panel', wrap);

    wrap.classList.add('optly-open');

    requestAnimationFrame(function () {
      position(panel);
      requestAnimationFrame(function () {
        if (panel) panel.classList.add('optly-panel-in');
      });
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

        customizeInjectedMarkup(body);

        requestAnimationFrame(function () {
          position(panel);
          clampScroll(panel);
        });
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

  var start = Date.now();
  (function tick() {
    if (qs(headerQtySel) && qs(triggerSel) && document.body) return init();
    if (Date.now() - start > 8000) return;
    setTimeout(tick, 120);
  })();
})();
