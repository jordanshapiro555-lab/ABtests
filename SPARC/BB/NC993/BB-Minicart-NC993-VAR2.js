(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var msgSel = '.utility-overlay__footer-message';
  var totalSel = '[data-totals-component="value"]';
  var doneAttr = 'data-complimentary-shipping';
  var origAttr = 'data-complimentary-shipping-orig'; // NEW: store original HTML
  var THRESHOLD = 200;

  // Show ONLY when total >= 200 AND made-on-demand item is NOT in cart
  var MOD_SEL = '[data-line-item-component="made-on-demand-details"]';

  function parseMoney(text) {
    if (!text) return 0;
    var n = String(text).replace(/[^0-9.]/g, '');
    return parseFloat(n) || 0;
  }

  function getContext(root) {
    var overlay = (root || document).querySelector(overlaySel);
    if (!overlay) return null;

    var totalEl = overlay.querySelector(totalSel);
    if (!totalEl) return null;

    return {
      overlay: overlay,
      totalEl: totalEl,
      msgEl: overlay.querySelector(msgSel)
    };
  }

  function hasMadeOnDemand(ctx) {
    if (!ctx || !ctx.overlay) return false;
    try {
      return !!ctx.overlay.querySelector(MOD_SEL);
    } catch (e) {
      return false;
    }
  }

  function cacheOriginal(msg) {
    // Save the default message HTML once, before we overwrite it
    if (msg.getAttribute(origAttr)) return;

    var html = msg.innerHTML || '';
    // Only cache if there's actually something there (avoids caching blank during early renders)
    if (html.replace(/\s+/g, '').length) {
      try {
        msg.setAttribute(origAttr, encodeURIComponent(html));
      } catch (e) {}
    }
  }

  function restoreOriginal(msg) {
    var stored = msg.getAttribute(origAttr);
    if (stored) {
      try {
        msg.innerHTML = decodeURIComponent(stored);
        return;
      } catch (e) {}
    }
    // Fallback if original wasn't captured for some reason
    msg.textContent = 'Shipping and taxes calculated at checkout.';
  }

  function apply(root) {
    var ctx = getContext(root);
    if (!ctx || !ctx.msgEl) return;

    var msg = ctx.msgEl;

    // NEW: cache default content as soon as we can
    cacheOriginal(msg);

    var total = parseMoney(ctx.totalEl.textContent);
    var mod = hasMadeOnDemand(ctx);

    var shouldShow = total >= THRESHOLD && !mod;
    var alreadyApplied = msg.getAttribute(doneAttr) === '1';

    // If conditions NOT met, remove custom message and restore default
    if (!shouldShow) {
      if (alreadyApplied) {
        msg.removeAttribute(doneAttr);
        restoreOriginal(msg); // NEW: restore instead of blanking
      } else {
        // Even if we never injected, ensure we don't leave it blank
        if (!msg.textContent || !msg.textContent.trim()) restoreOriginal(msg);
      }
      return;
    }

    // If already injected and still valid, do nothing
    if (alreadyApplied) return;

    // Clear only the shipping/tax message line area
    while (msg.firstChild) msg.removeChild(msg.firstChild);

    // Wrapper
    var wrap = document.createElement('div');
    wrap.style.display = 'block';

    // Row: icon + "Shipping: Complimentary"
    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'flex-start';
    row.style.gap = '10px';

    var icon = document.createElement('span');
    icon.style.width = '18px';
    icon.style.height = '18px';
    icon.style.borderRadius = '999px';
    icon.style.background = '#C6A24A'; // gold
    icon.style.display = 'inline-flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.marginTop = '2px';
    icon.setAttribute('aria-hidden', 'true');

    icon.innerHTML =
      '<svg viewBox="0 0 16 16" width="12" height="12" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="#fff" d="M6.35 11.2 3.2 8.05l1.06-1.06 2.09 2.09 5.41-5.41 1.06 1.06z"/>' +
      '</svg>';

    var title = document.createElement('div');
    title.textContent = 'Standard Shipping: Complimentary';
    title.style.color = '#1B2A41';
    title.style.fontWeight = '600';
    title.style.letterSpacing = '0.01em';

    row.appendChild(icon);
    row.appendChild(title);

    // Subtext
    var sub = document.createElement('div');
    sub.textContent = 'Taxes calculated at checkout';
    sub.style.marginLeft = '28px';
    sub.style.marginTop = '2px';
    sub.style.color = '#6B7280';
    sub.style.fontSize = '0.875em';
    sub.style.lineHeight = '1.25';

    wrap.appendChild(row);
    wrap.appendChild(sub);

    msg.appendChild(wrap);
    msg.setAttribute(doneAttr, '1');
  }

  // Run once
  apply(document);

  // Re-apply on minicart re-render
  var obs = new MutationObserver(function () {
    apply(document);
  });

  obs.observe(document.body, { childList: true, subtree: true });
})();
