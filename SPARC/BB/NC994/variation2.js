(function () {
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  var OVERLAY_ID = 'optly-savedbag-overlay';
  var SESSION_KEY = 'optly_savedbag_autoshow_v18';
  var VIEW_BAG_URL = 'https://www.brooksbrothers.com/on/demandware.store/Sites-brooksbrothers-Site/en_US/Cart-Show';

  var DESKTOP_MIN_WIDTH = 1024;

  /*
    Keep this intentionally narrow.
    Do NOT use broad selectors like:
    - #content
    - #contentframe
    - [id*="attentive"]
    - [class*="attentive"]

    Those can exist even when the actual email capture pop-up is not showing,
    which causes the saved-bag pop-up to wait until close.
  */
  var EMAIL_CAPTURE_SELECTORS = [
    '#fieldCaptureForm',
    '[data-testid="fieldCaptureForm"]',
    '#attentive_overlay',
    '[data-testid="modal"]',
    '[role="dialog"] #fieldCaptureForm',
    '[role="dialog"] [data-testid="fieldCaptureForm"]',
    '#closeIconContainer[data-testid="closeIcon"]'
  ].join(', ');

  var started = false;
  var resizeTimer = null;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function isDesktop() {
    return window.innerWidth >= DESKTOP_MIN_WIDTH;
  }

  function getQty() {
    var el = qs(headerQtySel);
    var n = el ? parseInt((el.textContent || '').trim(), 10) : 0;
    return isNaN(n) ? 0 : n;
  }

  function shown() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markShown() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (e) {}
  }

  function isVisible(el) {
    if (!el) return false;

    var style = window.getComputedStyle(el);

    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0'
    ) {
      return false;
    }

    var rect = el.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;
  }

  function isEmailCaptureVisible() {
    var nodes = qsa(EMAIL_CAPTURE_SELECTORS);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (!isVisible(node)) continue;

      var rect = node.getBoundingClientRect();

      var isMeaningfulModalSize =
        rect.width >= 250 &&
        rect.height >= 150;

      var isCloseIcon =
        node.matches &&
        node.matches('#closeIconContainer[data-testid="closeIcon"]');

      var modalParent =
        node.closest &&
        node.closest('[role="dialog"], #attentive_overlay, [data-testid="modal"]');

      if (isMeaningfulModalSize || isCloseIcon || modalParent) {
        return true;
      }
    }

    return false;
  }

  function syncOverlayContainer() {
    var overlayContainer = document.getElementById('overlayContainer');
    var wrap = document.getElementById(OVERLAY_ID);

    if (!overlayContainer) return;

    var isOpen = wrap && wrap.classList.contains('optly-open');
    overlayContainer.style.display = isOpen ? 'none' : '';
  }

  function getSavedBagItemCount(root) {
    return qsa('.utility-overlay__line-item.product-line-item.product-line-item--minicart', root).length;
  }

  function updateSavedBagTitle(root) {
    var title = qs('#optly-savedbag-title');
    if (!title) return;

    title.textContent = 'We Saved Your Bag! (' + getSavedBagItemCount(root || document) + ')';
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

      if (t && t.closest('[data-optly-close], .minicart__continue, [data-toggle-close]')) {
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
    if (!panelEl) return;

    var GAP = 10;
    var PAD = 12;

    var panelRect = panelEl.getBoundingClientRect();
    var panelW = panelRect.width || Math.min(440, window.innerWidth - PAD * 2);
    var panelH = panelRect.height || panelEl.scrollHeight || 320;

    if (isDesktop()) {
      var desktopLeft = Math.max(PAD, Math.round((window.innerWidth - panelW) / 2));
      var desktopTop = Math.max(
        PAD,
        Math.round((window.innerHeight - Math.min(panelH, window.innerHeight - PAD * 2)) / 2)
      );

      panelEl.style.left = desktopLeft + 'px';
      panelEl.style.top = desktopTop + 'px';

      panelEl.style.removeProperty('--optly-caret-left');
      panelEl.classList.remove('optly-caret-bottom');

      return;
    }

    var trigger = qs(triggerSel);
    if (!trigger) return;

    var r = trigger.getBoundingClientRect();

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
    caretX = Math.max(18, Math.min(caretX, panelW - 18));

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

      lineItems.style.maxHeight = Math.max(avail, 120) + 'px';
    }
  }

  function removeScripts(node) {
    qsa('script', node).forEach(function (s) {
      if (s.parentNode) s.parentNode.removeChild(s);
    });
  }

  function stripDupHeader(node) {
    var h = node.querySelector('.utility-overlay__header');

    if (h && h.parentNode) h.parentNode.removeChild(h);
  }

  function customizeInjectedMarkup(body) {
    qsa('.product-line-item__actions', body).forEach(function (el) {
      el.remove();
    });

    qsa('[data-line-item-component="remove-action"], [data-line-item-component="remove-confirm"]', body)
      .forEach(function (el) {
        var container = el.closest('.product-line-item__action') || el;

        if (container && container.parentNode) {
          container.remove();
        }
      });

    qsa('.product-line-item__qty-pricing .product-line-item__quantity, .product-line-item__quantity', body)
      .forEach(function (el) {
        el.remove();
      });

    qsa('.line-item-pricing-info', body).forEach(function (el) {
      var txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();

      if (txt.indexOf('qty:') === 0) {
        var quantityWrap = el.closest('.product-line-item__quantity');

        if (quantityWrap) {
          quantityWrap.remove();
        }
      }
    });

    qsa('.minicart-paypal-button, .checkout-express__button, .paypal-content, .paypal-cart-button, .js_paypal_button_on_cart_page, .button--paypal', body)
      .forEach(function (el) {
        el.remove();
      });

    qsa('[data-cart-component="disable-express-payments"], isapplepay, #apple-pay-button', body)
      .forEach(function (el) {
        el.remove();
      });

    qsa('.minicart__continue, a[title="View Shopping Bag"], .utility-overlay__footer-actions .link.link--primary.link--underline', body)
      .forEach(function (el) {
        el.remove();
      });

    var checkoutBtn = qs('[data-cart-component="checkout-action"], .checkout-btn', body);
    var originalCheckoutHref = checkoutBtn && checkoutBtn.tagName.toLowerCase() === 'a' ? checkoutBtn.href : '';

    if (checkoutBtn) {
      checkoutBtn.textContent = 'VIEW BAG';
      checkoutBtn.classList.add('optly-view-bag-btn');

      if (checkoutBtn.tagName.toLowerCase() === 'a') {
        checkoutBtn.href = VIEW_BAG_URL;
      }
    }

    var footerActions = qs('.utility-overlay__footer-actions', body);

    if (footerActions && !qs('.optly-checkout-now-btn', footerActions)) {
      var btn = document.createElement('a');

      btn.className = 'button optly-checkout-now-btn';
      btn.textContent = 'CHECKOUT';

      if (originalCheckoutHref) {
        btn.href = originalCheckoutHref;
      }

      footerActions.appendChild(btn);
    }
  }

  function openRenderedOverlay() {
    if (isEmailCaptureVisible()) return;

    var wrap = ensureShell();
    var panel = qs('.optly-panel', wrap);

    if (!panel) return;

    wrap.classList.add('optly-open');
    syncOverlayContainer();

    requestAnimationFrame(function () {
      if (isEmailCaptureVisible()) {
        closeOverlay();
        return;
      }

      clampScroll(panel);
      position(panel);

      requestAnimationFrame(function () {
        if (isEmailCaptureVisible()) {
          closeOverlay();
          return;
        }

        panel.classList.add('optly-panel-in');
      });
    });
  }

  function renderHTML(html) {
    if (isEmailCaptureVisible()) return;

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

    while (overlayNode.firstChild) {
      body.appendChild(overlayNode.firstChild);
    }

    customizeInjectedMarkup(body);
    updateSavedBagTitle(body);
    openRenderedOverlay();
  }

  function fetchAndShow() {
    if (isEmailCaptureVisible()) return;

    var trigger = qs(triggerSel);
    if (!trigger) return;

    var url = trigger.getAttribute(actionUrlAttr);
    if (!url) return;

    fetch(url, { credentials: 'include' })
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        renderHTML(html);
      })
      .catch(function () {});
  }

  function showWhenAllowed() {
    if (shown()) return;
    if (getQty() <= 0) return;

    /*
      New behavior:
      - Do not wait for the email capture pop-up to be closed.
      - Do not bind to the close button.
      - Try to show the saved-bag pop-up as soon as the true email capture modal is not visible.
      - If broad Attentive wrappers exist in the DOM, ignore them unless the actual capture modal is visible.
    */

    var attempts = 0;
    var maxAttempts = 40;

    function tryShow() {
      if (shown()) return;
      if (getQty() <= 0) return;

      attempts++;

      if (!isEmailCaptureVisible()) {
        markShown();
        fetchAndShow();
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(tryShow, 250);
      }
    }

    tryShow();
  }

  function onResize() {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      var wrap = document.getElementById(OVERLAY_ID);

      if (!wrap || !wrap.classList.contains('optly-open')) return;

      if (isEmailCaptureVisible()) {
        closeOverlay();
        return;
      }

      var panel = qs('.optly-panel', wrap);
      if (!panel) return;

      clampScroll(panel);
      position(panel);
    }, 80);
  }

  function onScroll() {
    var wrap = document.getElementById(OVERLAY_ID);

    if (!wrap || !wrap.classList.contains('optly-open')) return;

    if (isEmailCaptureVisible()) {
      closeOverlay();
      return;
    }

    var panel = qs('.optly-panel', wrap);
    if (!panel) return;

    if (!isDesktop()) {
      position(panel);
    }
  }

  function init() {
    if (started) return;
    started = true;

    showWhenAllowed();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
  }

  function boot() {
    var start = Date.now();

    (function tick() {
      if (qs(headerQtySel) && qs(triggerSel) && document.body) {
        init();
        return;
      }

      if (Date.now() - start > 8000) return;

      setTimeout(tick, 120);
    })();
  }

  function delayedStart() {
    setTimeout(boot, 3000);
  }

  if (document.readyState === 'complete') {
    delayedStart();
  } else {
    window.addEventListener('load', delayedStart);
  }
})();
