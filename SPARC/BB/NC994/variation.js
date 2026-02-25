(function () {
  // ---------------------------
  // Selectors from your HTML
  // ---------------------------
  var headerQtySel = '.header__utility-badge[data-minicart-component="qty"]';
  var triggerSel = '[data-minicart-component="trigger"]';
  var actionUrlAttr = 'data-action-url';

  // Our new overlay ID
  var OVERLAY_ID = 'optly-savedbag-overlay';

  // Once per session flag (NOT localStorage)
  var SESSION_KEY = 'optly_savedbag_shown_v1';

  // Poll / retry
  var POLL_MS = 100;
  var TIMEOUT_MS = 8000;

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function getQty() {
    var el = qs(headerQtySel);
    if (!el) return 0;
    var n = parseInt((el.textContent || '').trim(), 10);
    return isNaN(n) ? 0 : n;
  }

  function ensureOverlay() {
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
          '<p class="optly-meta">Loading your saved items…</p>',
        '</div>',
        '<div class="optly-footer">',
          '<div class="optly-actions">',
            '<a class="optly-btn optly-btn-primary" id="optly-savedbag-checkout" href="/checkout" role="button">Checkout</a>',
            '<a class="optly-btn optly-btn-link" id="optly-savedbag-viewbag" href="/cart" title="View Shopping Bag">View Shopping Bag</a>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(wrap);

    // Close handlers
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
    var wrap = ensureOverlay();
    var title = qs('#optly-savedbag-title', wrap);
    if (title) title.textContent = 'We Saved Your Bag! (' + getQty() + ')';
    wrap.classList.add('optly-open');
  }

  function closeOverlay() {
    var wrap = document.getElementById(OVERLAY_ID);
    if (wrap) wrap.classList.remove('optly-open');
  }

  function populateFromMinicartEndpoint() {
    // Best-effort: call the same SFRA endpoint as the minicart trigger
    var trigger = qs(triggerSel);
    if (!trigger) return;

    var url = trigger.getAttribute(actionUrlAttr);
    if (!url) return;

    fetch(url, { credentials: 'include' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;

        // Links
        var checkout = tmp.querySelector('[data-cart-component="checkout-action"]');
        var viewBag =
          tmp.querySelector('a[title="View Shopping Bag"]') ||
          tmp.querySelector('a[href*="Cart-Show"]') ||
          tmp.querySelector('a[href*="/cart"]');

        var ourCheckout = qs('#optly-savedbag-checkout');
        var ourViewBag = qs('#optly-savedbag-viewbag');
        if (checkout && checkout.getAttribute('href') && ourCheckout) ourCheckout.href = checkout.getAttribute('href');
        if (viewBag && viewBag.getAttribute('href') && ourViewBag) ourViewBag.href = viewBag.getAttribute('href');

        // Items
        var itemsRoot = tmp.querySelector('[data-minicart-component="items"]');
        var cards = itemsRoot ? itemsRoot.querySelectorAll('[data-cart-line-item]') : [];
        if (!cards || !cards.length) return;

        var wrap = ensureOverlay();
        var body = qs('#optly-savedbag-body', wrap);
        if (!body) return;

        var out = [];
        Array.prototype.forEach.call(cards, function (card) {
          var nameEl = card.querySelector('.product-line-item__name');
          var imgEl = card.querySelector('img.product-line-item__image');
          var colorEl = card.querySelector('[data-line-item-component="color"] .product-line-item__attribute-value');

          // Common BB attributes vary by product; keep it light
          var sizeEl =
            card.querySelector('[data-line-item-component="Waist"] .product-line-item__attribute-value') ||
            card.querySelector('[data-line-item-component="chest"] .product-line-item__attribute-value') ||
            card.querySelector('[data-line-item-component="Length"] .product-line-item__attribute-value') ||
            card.querySelector('[data-line-item-component="Inseam"] .product-line-item__attribute-value');

          var name = nameEl ? (nameEl.textContent || '').trim() : 'Item';
          var href = nameEl && nameEl.getAttribute('href') ? nameEl.getAttribute('href') : '#';
          var img = imgEl && imgEl.getAttribute('src') ? imgEl.getAttribute('src') : '';

          var metaBits = [];
          if (colorEl && colorEl.textContent) metaBits.push('Color: ' + colorEl.textContent.trim());
          if (sizeEl && sizeEl.textContent) metaBits.push(sizeEl.textContent.trim());

          out.push(
            '<div class="optly-row">' +
              (img ? '<img class="optly-img" src="' + img + '" alt=""/>' : '<div class="optly-img"></div>') +
              '<div>' +
                '<p class="optly-name"><a href="' + href + '" style="color:inherit;text-decoration:none;">' + name + '</a></p>' +
                (metaBits.length ? '<p class="optly-meta">' + metaBits.join(' • ') + '</p>' : '') +
              '</div>' +
            '</div>'
          );
        });

        body.innerHTML = out.join('');
      })
      .catch(function () {
        // silent fail
      });
  }

  function shouldShowOncePerSession() {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== '1';
    } catch (e) {
      // If sessionStorage is blocked, fall back to showing once per page load
      return true;
    }
  }

  function markShownThisSession() {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
  }

  function initAutoOpen() {
    // Only show if: not shown this session AND cart has items
    if (!shouldShowOncePerSession()) return;
    if (getQty() <= 0) return;

    // Mark immediately so it never shows again this session
    markShownThisSession();

    // Create + open overlay
    openOverlay();

    // Fill with actual cart content
    populateFromMinicartEndpoint();
  }

  // Wait for header qty/trigger to exist
  var start = Date.now();
  (function tick() {
    var qtyReady = qs(headerQtySel);
    var triggerReady = qs(triggerSel);

    if (qtyReady && triggerReady) {
      initAutoOpen();
      return;
    }

    if (Date.now() - start < TIMEOUT_MS) setTimeout(tick, POLL_MS);
  })();
})();
