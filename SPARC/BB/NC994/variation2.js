(function () {
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  var OVERLAY_ID = 'optly-savedbag-overlay';
  var SESSION_KEY = 'optly_savedbag_autoshow_v23';
  var VIEW_BAG_URL = 'https://www.brooksbrothers.com/on/demandware.store/Sites-brooksbrothers-Site/en_US/Cart-Show';

  var DESKTOP_MIN_WIDTH = 1024;
  var INITIAL_EMAIL_WAIT_MS = 1500;
  var CONFIRM_CLOSED_MS = 500;
  var AFTER_EMAIL_CLOSE_DELAY_MS = 1500;
  var POLL_MS = 150;

  var started = false;
  var flowStarted = false;
  var emailWasSeen = false;
  var waitStartedAt = 0;
  var resizeTimer = null;
  var pollTimer = null;
  var confirmTimer = null;
  var delayTimer = null;

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
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    );
  }

  function isEmailCaptureVisible() {
    var closeBtn = qs('#closeIconContainer[data-testid="closeIcon"]');
    if (isVisible(closeBtn)) return true;

    var forms = qsa('#fieldCaptureForm, [data-testid="fieldCaptureForm"]');

    for (var i = 0; i < forms.length; i++) {
      if (!isVisible(forms[i])) continue;

      var rect = forms[i].getBoundingClientRect();

      if (rect.width >= 200 && rect.height >= 100) {
        return true;
      }
    }

    return false;
  }

  function clearTimer(timer) {
    if (timer) clearTimeout(timer);
  }

  function clearFlowTimers() {
    clearTimer(pollTimer);
    clearTimer(confirmTimer);
    clearTimer(delayTimer);
    pollTimer = null;
    confirmTimer = null;
    delayTimer = null;
  }

  function syncOverlayContainer() {
    var overlayContainer = document.getElementById('overlayContainer');
    var wrap = document.getElementById(OVERLAY_ID);

    if (!overlayContainer) return;

    overlayContainer.style.display =
      wrap && wrap.classList.contains('optly-open') ? 'none' : '';
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
      if (e.target && e.target.closest('[data-optly-close], .minicart__continue, [data-toggle-close]')) {
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
    wrap.removeAttribute('data-optly-hidden-for-attentive');

    var panel = qs('.optly-panel', wrap);
    if (panel) panel.classList.remove('optly-panel-in');

    wrap.style.zIndex = '';
    wrap.style.pointerEvents = '';
    wrap.style.visibility = '';
    wrap.style.opacity = '';

    syncOverlayContainer();
  }

  function getSavedBagItemCount(root) {
    return qsa('.utility-overlay__line-item.product-line-item.product-line-item--minicart', root).length;
  }

  function updateSavedBagTitle(root) {
    var title = qs('#optly-savedbag-title');
    if (title) title.textContent = 'We Saved Your Bag! (' + getSavedBagItemCount(root || document) + ')';
  }

  function position(panel) {
    if (!panel) return;

    var GAP = 10;
    var PAD = 12;
    var panelRect = panel.getBoundingClientRect();
    var panelW = panelRect.width || Math.min(440, window.innerWidth - PAD * 2);
    var panelH = panelRect.height || panel.scrollHeight || 320;

    if (isDesktop()) {
      panel.style.left = Math.max(PAD, Math.round((window.innerWidth - panelW) / 2)) + 'px';
      panel.style.top = Math.max(
        PAD,
        Math.round((window.innerHeight - Math.min(panelH, window.innerHeight - PAD * 2)) / 2)
      ) + 'px';

      panel.style.removeProperty('--optly-caret-left');
      panel.classList.remove('optly-caret-bottom');

      return;
    }

    var trigger = qs(triggerSel);
    if (!trigger) return;

    var r = trigger.getBoundingClientRect();
    var left = r.left + r.width / 2 - panelW / 2;

    left = Math.max(PAD, Math.min(left, window.innerWidth - panelW - PAD));

    var top = r.bottom + GAP;
    var maxH = Math.floor(window.innerHeight * 0.6);
    var estH = panel.scrollHeight || 320;

    if (top + Math.min(estH, maxH) > window.innerHeight - PAD) {
      top = Math.max(PAD, r.top - GAP - Math.min(estH, maxH));
    }

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';

    var caretX = r.left + r.width / 2 - left;
    caretX = Math.max(18, Math.min(caretX, panelW - 18));

    panel.style.setProperty('--optly-caret-left', caretX + 'px');
    panel.classList.toggle('optly-caret-bottom', top < r.top);
  }

  function clampScroll(panel) {
    var maxPanel = Math.floor(window.innerHeight * 0.6);
    var header = qs('.optly-header', panel);
    var body = qs('#optly-savedbag-body', panel);
    var lineItems = body && qs('.utility-overlay__line-items', body);
    var footer = body && qs('.utility-overlay__footer', body);

    if (!header || !lineItems) return;

    lineItems.style.overflow = 'auto';
    lineItems.style.maxHeight = '';

    if (panel.scrollHeight > maxPanel) {
      var available =
        maxPanel -
        header.getBoundingClientRect().height -
        (footer ? footer.getBoundingClientRect().height : 0);

      lineItems.style.maxHeight = Math.max(available, 120) + 'px';
    }
  }

  function cleanMarkup(body) {
    qsa('script', body).forEach(function (el) {
      el.remove();
    });

    qsa([
      '.utility-overlay__header',
      '.product-line-item__actions',
      '[data-line-item-component="remove-action"]',
      '[data-line-item-component="remove-confirm"]',
      '.product-line-item__quantity',
      '.minicart-paypal-button',
      '.checkout-express__button',
      '.paypal-content',
      '.paypal-cart-button',
      '.js_paypal_button_on_cart_page',
      '.button--paypal',
      '[data-cart-component="disable-express-payments"]',
      'isapplepay',
      '#apple-pay-button',
      '.minicart__continue',
      'a[title="View Shopping Bag"]',
      '.utility-overlay__footer-actions .link.link--primary.link--underline'
    ].join(','), body).forEach(function (el) {
      el.remove();
    });

    qsa('.line-item-pricing-info', body).forEach(function (el) {
      var txt = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var quantityWrap = el.closest('.product-line-item__quantity');

      if (txt.indexOf('qty:') === 0 && quantityWrap) {
        quantityWrap.remove();
      }
    });
  }

  function customizeButtons(body) {
    var checkoutBtn = qs('[data-cart-component="checkout-action"], .checkout-btn', body);
    var originalCheckoutHref =
      checkoutBtn && checkoutBtn.tagName.toLowerCase() === 'a'
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

  function openOverlay() {
    if (shown() || getQty() <= 0) return;

    if (isEmailCaptureVisible()) {
      emailWasSeen = true;
      closeOverlay();
      waitThenOpen();
      return;
    }

    var trigger = qs(triggerSel);
    if (!trigger) return;

    var url = trigger.getAttribute(actionUrlAttr);
    if (!url) return;

    markShown();

    fetch(url, { credentials: 'include' })
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        if (isEmailCaptureVisible()) {
          emailWasSeen = true;
          waitThenOpen();
          return;
        }

        var wrap = ensureShell();
        var body = qs('#optly-savedbag-body', wrap);
        var tmp = document.createElement('div');

        tmp.innerHTML = html;

        var overlayNode =
          tmp.querySelector('[data-minicart-component="overlay"]') ||
          tmp.querySelector('.header__minicart-overlay') ||
          tmp;

        body.innerHTML = '';

        while (overlayNode.firstChild) {
          body.appendChild(overlayNode.firstChild);
        }

        cleanMarkup(body);
        customizeButtons(body);
        updateSavedBagTitle(body);
        renderOpen();
      })
      .catch(function () {});
  }

  function renderOpen() {
    if (isEmailCaptureVisible()) {
      emailWasSeen = true;
      closeOverlay();
      waitThenOpen();
      return;
    }

    var wrap = ensureShell();
    var panel = qs('.optly-panel', wrap);

    if (!panel) return;

    wrap.classList.add('optly-open');
    syncOverlayContainer();

    requestAnimationFrame(function () {
      if (isEmailCaptureVisible()) {
        emailWasSeen = true;
        closeOverlay();
        waitThenOpen();
        return;
      }

      position(panel);
      clampScroll(panel);

      requestAnimationFrame(function () {
        if (isEmailCaptureVisible()) {
          emailWasSeen = true;
          closeOverlay();
          waitThenOpen();
          return;
        }

        panel.classList.add('optly-panel-in');
      });
    });
  }

  function waitThenOpen() {
    if (shown() || getQty() <= 0) return;

    clearFlowTimers();

    pollTimer = setTimeout(function poll() {
      if (shown() || getQty() <= 0) return;

      if (isEmailCaptureVisible()) {
        emailWasSeen = true;
        closeOverlay();
        pollTimer = setTimeout(poll, POLL_MS);
        return;
      }

      if (emailWasSeen) {
        confirmTimer = setTimeout(function () {
          if (isEmailCaptureVisible()) {
            waitThenOpen();
            return;
          }

          delayTimer = setTimeout(openOverlay, AFTER_EMAIL_CLOSE_DELAY_MS);
        }, CONFIRM_CLOSED_MS);

        return;
      }

      if (Date.now() - waitStartedAt >= INITIAL_EMAIL_WAIT_MS) {
        openOverlay();
        return;
      }

      pollTimer = setTimeout(poll, POLL_MS);
    }, POLL_MS);
  }

  function showWhenAllowed() {
    if (flowStarted || shown() || getQty() <= 0) return;

    flowStarted = true;
    emailWasSeen = false;
    waitStartedAt = Date.now();

    waitThenOpen();
  }

  function onResize() {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      var wrap = document.getElementById(OVERLAY_ID);
      var panel = wrap && qs('.optly-panel', wrap);

      if (!wrap || !wrap.classList.contains('optly-open') || !panel) return;

      if (isEmailCaptureVisible()) {
        emailWasSeen = true;
        closeOverlay();
        waitThenOpen();
        return;
      }

      position(panel);
      clampScroll(panel);
    }, 80);
  }

  function onScroll() {
    var wrap = document.getElementById(OVERLAY_ID);
    var panel = wrap && qs('.optly-panel', wrap);

    if (!wrap || !wrap.classList.contains('optly-open') || !panel) return;

    if (isEmailCaptureVisible()) {
      emailWasSeen = true;
      closeOverlay();
      waitThenOpen();
      return;
    }

    if (!isDesktop()) position(panel);
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

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(boot, 500);
} else {
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(boot, 500);
  });
}
})();
