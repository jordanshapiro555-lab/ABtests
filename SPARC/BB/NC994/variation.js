(function () {
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  var OVERLAY_ID = 'optly-savedbag-overlay';
  var SESSION_KEY = 'optly_savedbag_autoshow_v11';
  var DISMISS_POPUP_SEL = '#closeIconContainer[data-testid="closeIcon"]';
  var VIEW_BAG_URL = 'https://www.brooksbrothers.com/on/demandware.store/Sites-brooksbrothers-Site/en_US/Cart-Show';

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function getQty() {
    var el = qs(headerQtySel);
    var n = el ? parseInt((el.textContent || '').trim(), 10) : 0;
    return isNaN(n) ? 0 : n;
  }

  function getSavedBagItemCount(root) {
    return qsa('.utility-overlay__line-item.product-line-item.product-line-item--minicart', root).length;
  }

  function updateSavedBagTitle(root) {
    var title = qs('#optly-savedbag-title');
    if (!title) return;
    title.textContent = 'We Saved Your Bag! (' + getSavedBagItemCount(root || document) + ')';
  }

  function shown() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; }
    catch (e) { return false; }
  }

  function markShown() {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
  }

  function isVisible(el) {
    if (!el) return false;
    var rect = el.getBoundingClientRect();
    var style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function shouldDelayForDismissButton() {
    return isVisible(qs(DISMISS_POPUP_SEL));
  }

  function syncOverlayContainer() {
    var savedBag = document.getElementById(OVERLAY_ID);
    var overlayContainer = document.getElementById('overlayContainer');
    if (!overlayContainer) return;

    if (savedBag && savedBag.classList.contains('optly-open')) {
      overlayContainer.style.display = 'none';
    } else {
      overlayContainer.style.display = '';
    }
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
            '<p class="optly-title" id="optly-savedbag-title">We Saved Your Bag! (0)</p>',
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
    syncOverlayContainer();
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
    qsa('.product-line-item__actions', body).forEach(function (el) {
      el.remove();
    });

    qsa('[data-line-item-component="remove-action"], [data-line-item-component="remove-confirm"]', body)
      .forEach(function (el) {
        var container = el.closest('.product-line-item__action') || el;
        if (container && container.parentNode) container.remove();
      });

    qsa('.product-line-item__qty-pricing .product-line-item__quantity', body).forEach(function (el) {
      el.remove();
    });

    qsa('.line-item-pricing-info', body).forEach(function (el) {
      var txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (txt.indexOf('qty:') === 0) {
        var quantityWrap = el.closest('.product-line-item__quantity');
        if (quantityWrap) quantityWrap.remove();
      }
    });

    qsa('.minicart-paypal-button, .checkout-express__button, .paypal-content, .paypal-cart-button, .js_paypal_button_on_cart_page, .button--paypal', body)
      .forEach(function (el) { el.remove(); });

    qsa('[data-cart-component="disable-express-payments"], isapplepay, #apple-pay-button', body)
      .forEach(function (el) { el.remove(); });

    qsa('.minicart__continue, a[title="View Shopping Bag"], .utility-overlay__footer-actions .link.link--primary.link--underline', body)
      .forEach(function (el) { el.remove(); });

    var checkoutBtn = qs('[data-cart-component="checkout-action"], .checkout-btn', body);
    var originalCheckoutHref = checkoutBtn && checkoutBtn.tagName.toLowerCase() === 'a'
      ? checkoutBtn.href
      : '';

    if (checkoutBtn) {
      checkoutBtn.textContent = 'VIEW BAG';
      checkoutBtn.classList.add('optly-view-bag-btn');

      if (checkoutBtn.tagName.toLowerCase() === 'a') {
        checkoutBtn.href = VIEW_BAG_URL;
      }
    }

    var footerActions = qs('.utility-overlay__footer-actions', body);
    if (footerActions) {
      var existingCheckoutNow = qs('.optly-checkout-now-btn', footerActions);
      if (!existingCheckoutNow) {
        var btn = document.createElement('a');
        btn.className = 'button optly-checkout-now-btn';
        btn.textContent = 'CHECKOUT NOW';
        if (originalCheckoutHref) btn.href = originalCheckoutHref;
        footerActions.appendChild(btn);
      }
    }
  }

  function showLoadedOverlay() {
    var wrap = ensureShell();
    var panel = qs('.optly-panel', wrap);
    if (!panel) return;

    wrap.classList.add('optly-open');
    syncOverlayContainer();

    requestAnimationFrame(function () {
      position(panel);
      clampScroll(panel);
      requestAnimationFrame(function () {
        panel.classList.add('optly-panel-in');
      });
    });
  }

  function populateAndShow() {
    var trigger = qs(triggerSel);
    if (!trigger) return;

    var url = trigger.getAttribute(actionUrlAttr);
    if (!url) return;

    fetch(url, { credentials: 'include' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var wrap = ensureShell();
        var body = qs('#optly-savedbag-body', wrap);
        if (!body) return;

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
        updateSavedBagTitle(body);

        showLoadedOverlay();
      })
      .catch(function () {});
  }

  function showWhenAllowed() {
    if (shown()) return;
    if (getQty() <= 0) return;

    if (shouldDelayForDismissButton()) {
      var dismissBtn = qs(DISMISS_POPUP_SEL);
      if (!dismissBtn || dismissBtn.__optlySavedBagBound) return;

      dismissBtn.__optlySavedBagBound = true;
      dismissBtn.addEventListener('click', function () {
        if (shown()) return;
        if (getQty() <= 0) return;
        markShown();
        populateAndShow();
      }, { once: true });

      return;
    }

    markShown();
    populateAndShow();
  }

  function init() {
    showWhenAllowed();

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
