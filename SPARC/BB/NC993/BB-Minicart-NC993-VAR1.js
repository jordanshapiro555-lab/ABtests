(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var headerSel = '.utility-overlay__header';
  var titleRowSel = '.utility-overlay__header .flex';
  var totalSel = '[data-totals-component="value"]';
  var msgSel = '.utility-overlay__footer-message';

  var bannerId = 'bb-complimentary-ship-banner';
  var THRESHOLD = 200;

  // Made-on-demand marker (as you described)
  var MOD_SEL = '[data-line-item-component="made-on-demand-details"]';

  var lastTotal = null;
  var lastHasMOD = null;

  function parseMoney(text) {
    if (!text) return 0;
    var n = String(text).replace(/[^0-9.]/g, '');
    return parseFloat(n) || 0;
  }

  function getContext() {
    var overlay = document.querySelector(overlaySel);
    if (!overlay) return null;

    var totalEl = overlay.querySelector(totalSel);
    if (!totalEl) return null;

    return {
      overlay: overlay,
      header: overlay.querySelector(headerSel),
      titleRow: overlay.querySelector(titleRowSel),
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

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = bannerId;

    var frame = document.createElement('div');
    frame.className = 'bb-frame';
    banner.appendChild(frame);

    var icon = document.createElement('span');
    icon.className = 'bb-ic';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
      '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="#fff" d="M6.35 11.2 3.2 8.05l1.06-1.06 2.09 2.09 5.41-5.41 1.06 1.06z"/>' +
      '</svg>';

    var textWrap = document.createElement('div');

    var headline = document.createElement('p');
    headline.className = 'bb-ttl';
    headline.textContent = "You’ve Earned Free Shipping!";

    var sub = document.createElement('p');
    sub.className = 'bb-sub';
    sub.textContent = 'Standard shipping is free with your order.';

    textWrap.appendChild(headline);
    textWrap.appendChild(sub);

    banner.appendChild(icon);
    banner.appendChild(textWrap);

    return banner;
  }

  function upsertBanner(ctx, total, hasMOD) {
    if (!ctx.header) return;

    var existing = ctx.header.querySelector('#' + bannerId);

    // Show ONLY when:
    // 1) total >= 200
    // 2) made-on-demand item is NOT in cart
    var shouldShow = total >= THRESHOLD && !hasMOD;

    if (shouldShow) {
      if (!existing) {
        var banner = buildBanner();

        if (ctx.titleRow && ctx.titleRow.parentNode === ctx.header) {
          ctx.header.insertBefore(banner, ctx.titleRow.nextSibling);
        } else {
          ctx.header.appendChild(banner);
        }

        // Match header padding for inset alignment
        try {
          var cs = window.getComputedStyle(ctx.header);
          banner.style.marginLeft = cs.paddingLeft;
          banner.style.marginRight = cs.paddingRight;
        } catch (e) {}
      }
    } else {
      if (existing) existing.remove();
    }
  }

  function updateFooterMessage(ctx, total, hasMOD) {
    if (!ctx.msgEl) return;

    var shouldShowFreeShipState = total >= THRESHOLD && !hasMOD;

    var next = shouldShowFreeShipState
      ? 'Taxes calculated at checkout.'
      : 'Shipping and taxes calculated at checkout.';

    if ((ctx.msgEl.textContent || '').trim() !== next) ctx.msgEl.textContent = next;
  }

  function render(force) {
    var ctx = getContext();
    if (!ctx) return false;

    var total = parseMoney(ctx.totalEl.textContent);
    var mod = hasMadeOnDemand(ctx);

    // Avoid thrashing: rerender when total OR MOD presence changes
    if (
      !force &&
      lastTotal !== null &&
      lastHasMOD !== null &&
      Math.abs(total - lastTotal) < 0.001 &&
      mod === lastHasMOD
    ) {
      return true;
    }

    lastTotal = total;
    lastHasMOD = mod;

    upsertBanner(ctx, total, mod);
    updateFooterMessage(ctx, total, mod);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Flicker fix:
  // The minicart subtree is being re-rendered after we insert the banner.
  // So: whenever we detect a meaningful change, we "stabilize" by re-rendering
  // multiple times over a short window (covers async redraws / partial swaps).
  // ---------------------------------------------------------------------------

  var scheduled = false;
  var stabilizeTimer = null;

  function stabilizeRenders() {
    // multiple passes to outlast SFRA redraws that happen shortly after open/update
    render(true);
    setTimeout(function () { render(true); }, 50);
    setTimeout(function () { render(true); }, 150);
    setTimeout(function () { render(true); }, 300);
    setTimeout(function () { render(true); }, 600);
  }

  function scheduleStabilize() {
    if (scheduled) return;
    scheduled = true;

    // next tick coalesce
    setTimeout(function () {
      scheduled = false;
      stabilizeRenders();
    }, 0);

    // also extend a short stabilization window if events keep firing
    if (stabilizeTimer) clearTimeout(stabilizeTimer);
    stabilizeTimer = setTimeout(function () {
      stabilizeTimer = null;
    }, 800);
  }

  // Observe overlay (it always exists) for:
  // - open/close class changes
  // - subtree swaps that remove our banner
  // Also: totalEl is frequently replaced, so we re-bind a dedicated observer when it changes.
  var overlayObs = null;
  var totalObs = null;
  var lastObservedTotalEl = null;

  function bindTotalObserver(totalEl) {
    if (!totalEl || totalEl === lastObservedTotalEl) return;
    lastObservedTotalEl = totalEl;

    try {
      if (totalObs) totalObs.disconnect();
    } catch (e) {}

    try {
      totalObs = new MutationObserver(function () {
        scheduleStabilize();
      });
      totalObs.observe(totalEl, { characterData: true, childList: true, subtree: true });
    } catch (e) {
      totalObs = null;
    }
  }

  function startObservers() {
    var overlay = document.querySelector(overlaySel);
    if (!overlay) return;

    if (!overlayObs) {
      try {
        overlayObs = new MutationObserver(function () {
          // Any subtree churn/open-state change => stabilize
          scheduleStabilize();

          // Rebind total observer if totalEl got replaced
          var ctx = getContext();
          if (ctx && ctx.totalEl) bindTotalObserver(ctx.totalEl);
        });

        overlayObs.observe(overlay, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['class', 'style', 'aria-hidden', 'data-focustrap-enabled']
        });
      } catch (e) {
        overlayObs = null;
      }
    }

    // Ensure we have a total observer on the current total node
    var ctx = getContext();
    if (ctx && ctx.totalEl) bindTotalObserver(ctx.totalEl);
  }

  // Initial attempt
  render(true);
  startObservers();

  // On ajax updates (SFRA often uses jQuery)
  if (window.jQuery && typeof window.jQuery === 'function') {
    window.jQuery(document).ajaxComplete(function () {
      setTimeout(function () {
        startObservers();
        scheduleStabilize();
      }, 0);
    });
  }

  // On user interaction that typically opens minicart
  document.addEventListener(
    'click',
    function () {
      // If the overlay exists but contents update slightly later, stabilize.
      startObservers();
      scheduleStabilize();

      // short bounded retry to catch delayed swaps on open
      var tries = 0;
      var t = setInterval(function () {
        tries++;
        startObservers();
        render(true);
        if (getContext() || tries >= 12) clearInterval(t);
      }, 120);
    },
    true
  );

  // SPA-ish navigation fallback
  window.addEventListener('popstate', function () {
    setTimeout(function () {
      lastTotal = null;
      lastHasMOD = null;
      lastObservedTotalEl = null;
      try { if (totalObs) totalObs.disconnect(); } catch (e) {}
      totalObs = null;
      render(true);
      startObservers();
      scheduleStabilize();
    }, 0);
  });
})();
