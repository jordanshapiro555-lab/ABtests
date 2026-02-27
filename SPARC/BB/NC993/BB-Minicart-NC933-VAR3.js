(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var totalsSel = '.utility-overlay__footer-totals';
  var totalValueSel = '[data-totals-component="value"]';
  var msgSel = '.utility-overlay__footer-message';

  var moduleId = 'bb-free-ship-progress';
  var THRESHOLD = 200;

  // NEW: Made-on-demand marker (as you described)
  var MOD_SEL = '[data-line-item-component="made-on-demand-details"]';

  var lastTotal = null; // used to avoid re-writing on every call
  var lastHasMOD = null; // NEW: avoid "sticky" behavior when MOD added/removed

  function parseMoney(text) {
    if (!text) return 0;
    var n = String(text).replace(/[^0-9.]/g, '');
    return parseFloat(n) || 0;
  }

  function formatDollars(amount) {
    return '$' + String(Math.ceil(amount));
  }

  function getContext() {
    var overlay = document.querySelector(overlaySel);
    if (!overlay) return null;

    var totals = overlay.querySelector(totalsSel);
    var totalEl = overlay.querySelector(totalValueSel);
    var msgEl = overlay.querySelector(msgSel);

    if (!totals || !totalEl) return null;

    return { overlay: overlay, totals: totals, totalEl: totalEl, msgEl: msgEl };
  }

  // NEW
  function hasMadeOnDemand(ctx) {
    if (!ctx || !ctx.overlay) return false;
    try {
      return !!ctx.overlay.querySelector(MOD_SEL);
    } catch (e) {
      return false;
    }
  }

  function buildModule() {
    var wrap = document.createElement('div');
    wrap.className = 'bb-shipprog';
    wrap.id = moduleId;

    var row = document.createElement('div');
    row.className = 'bb-shipprog__row';

    var label = document.createElement('div');
    label.className = 'bb-shipprog__label';

    var status = document.createElement('div');
    status.className = 'bb-shipprog__status';

    var bar = document.createElement('div');
    bar.className = 'bb-shipprog__bar';

    var fill = document.createElement('div');
    fill.className = 'bb-shipprog__fill';

    bar.appendChild(fill);
    row.appendChild(label);
    row.appendChild(status);
    wrap.appendChild(row);
    wrap.appendChild(bar);

    return wrap;
  }

  function setProgressState(moduleEl, total) {
    var labelEl = moduleEl.querySelector('.bb-shipprog__label');
    var statusEl = moduleEl.querySelector('.bb-shipprog__status');
    var fillEl = moduleEl.querySelector('.bb-shipprog__fill');

    var remaining = THRESHOLD - total;
    var qualified = remaining <= 0;

    // Only rebuild status content when state changes
    var nextState = qualified ? 'qualified' : 'progress';
    if (moduleEl.getAttribute('data-state') !== nextState) {
      while (statusEl.firstChild) statusEl.removeChild(statusEl.firstChild);

      if (qualified) {
        var check = document.createElement('span');
        check.className = 'bb-shipprog__check';
        check.setAttribute('aria-hidden', 'true');
        check.innerHTML =
          '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
          '<path fill="#fff" d="M6.35 11.2 3.2 8.05l1.06-1.06 2.09 2.09 5.41-5.41 1.06 1.06z"/>' +
          '</svg>';
        statusEl.appendChild(check);
      }

      moduleEl.setAttribute('data-state', nextState);
    }

    if (qualified) {
      if (labelEl.textContent !== 'Order Qualified for Complimentary Shipping') {
        labelEl.textContent = 'Order Qualified for Complimentary Shipping';
      }
      fillEl.style.width = '100%';
    } else {
      var label = formatDollars(remaining) + ' Away From Free Shipping';
      if (labelEl.textContent !== label) labelEl.textContent = label;

      var pct = Math.max(0, Math.min(1, total / THRESHOLD));
      var width = String(Math.round(pct * 100)) + '%';
      if (fillEl.style.width !== width) fillEl.style.width = width;
    }
  }

  function setFooterMessage(msgEl, total) {
    if (!msgEl) return;

    var next =
      total >= THRESHOLD
        ? 'Taxes calculated at checkout.'
        : 'Shipping and taxes calculated at checkout.';

    if (msgEl.textContent.trim() !== next) msgEl.textContent = next;
  }

  function render(force) {
    var ctx = getContext();
    if (!ctx) return false;

    var total = parseMoney(ctx.totalEl.textContent);
    var hasMOD = hasMadeOnDemand(ctx);

    // Prevent thrashing: if neither total nor MOD presence changed, do nothing.
    if (
      !force &&
      lastTotal !== null &&
      lastHasMOD !== null &&
      Math.abs(total - lastTotal) < 0.001 &&
      hasMOD === lastHasMOD
    ) {
      return true;
    }
    lastTotal = total;
    lastHasMOD = hasMOD;

    // IMPORTANT: "Make no changes if on-demand item is in cart"
    // - remove our module if it exists
    // - do not alter footer message
    if (hasMOD) {
      var existingMod = ctx.totals.querySelector('#' + moduleId);
      if (existingMod) existingMod.remove();
      return true;
    }

    // Progress module (only when NO made-on-demand items are present)
    var existing = ctx.totals.querySelector('#' + moduleId);
    if (!existing) {
      existing = buildModule();
      ctx.totals.insertBefore(existing, ctx.totals.firstChild);
    }
    setProgressState(existing, total);

    // Footer message (only when NO made-on-demand items are present)
    setFooterMessage(ctx.msgEl, total);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Persistence / anti-flicker logic (same approach as the banner fix):
  // SFRA re-renders parts of the minicart and can wipe injected nodes.
  // We re-render multiple times shortly after meaningful changes and
  // re-bind observers when key nodes (total/totals) are replaced.
  // ---------------------------------------------------------------------------

  var scheduled = false;
  var stabilizeTimer = null;

  function stabilizeRenders() {
    render(true);
    setTimeout(function () { render(true); }, 50);
    setTimeout(function () { render(true); }, 150);
    setTimeout(function () { render(true); }, 300);
    setTimeout(function () { render(true); }, 600);
  }

  function scheduleStabilize() {
    if (scheduled) return;
    scheduled = true;

    setTimeout(function () {
      scheduled = false;
      stabilizeRenders();
    }, 0);

    if (stabilizeTimer) clearTimeout(stabilizeTimer);
    stabilizeTimer = setTimeout(function () {
      stabilizeTimer = null;
    }, 800);
  }

  var overlayObs = null;
  var totalsObs = null;
  var totalObs = null;

  var lastObservedTotals = null;
  var lastObservedTotalEl = null;

  function bindTotalsObserver(totalsEl) {
    if (!totalsEl || totalsEl === lastObservedTotals) return;
    lastObservedTotals = totalsEl;

    try { if (totalsObs) totalsObs.disconnect(); } catch (e) {}
    totalsObs = null;

    try {
      totalsObs = new MutationObserver(function () {
        scheduleStabilize();
      });
      totalsObs.observe(totalsEl, { childList: true, subtree: true });
    } catch (e) {
      totalsObs = null;
    }
  }

  function bindTotalObserver(totalEl) {
    if (!totalEl || totalEl === lastObservedTotalEl) return;
    lastObservedTotalEl = totalEl;

    try { if (totalObs) totalObs.disconnect(); } catch (e) {}
    totalObs = null;

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
          // Any overlay churn or open-state change => stabilize.
          scheduleStabilize();

          // Rebind if SFRA swapped out these nodes.
          var ctx = getContext();
          if (ctx) {
            bindTotalsObserver(ctx.totals);
            bindTotalObserver(ctx.totalEl);
          }
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

    var ctx = getContext();
    if (ctx) {
      bindTotalsObserver(ctx.totals);
      bindTotalObserver(ctx.totalEl);
    }
  }

  // --- Trigger strategy (keep original behavior, add persistence) ---

  // 1) Run once at start
  render(true);
  startObservers();

  // 2) On minicart open clicks (cheap + works without jQuery)
  document.addEventListener(
    'click',
    function () {
      startObservers();
      scheduleStabilize();

      // Short, bounded retries to catch async drawer render
      var tries = 0;
      var t = setInterval(function () {
        tries++;
        startObservers();
        render(true);

        // Stop when we actually have context (overlay always exists on your site)
        if (getContext() || tries >= 12) clearInterval(t);
      }, 120);
    },
    true
  );

  // 3) If jQuery exists, hook into ajaxComplete (best for SFRA minicart updates)
  if (window.jQuery && typeof window.jQuery === 'function') {
    window.jQuery(document).ajaxComplete(function () {
      setTimeout(function () {
        startObservers();
        scheduleStabilize();
      }, 0);
    });
  }

  // 4) Also re-render on history navigation in SPA-ish cases
  window.addEventListener('popstate', function () {
    setTimeout(function () {
      lastTotal = null;
      lastHasMOD = null;
      lastObservedTotals = null;
      lastObservedTotalEl = null;
      try { if (totalsObs) totalsObs.disconnect(); } catch (e) {}
      try { if (totalObs) totalsObs.disconnect(); } catch (e) {}
      totalsObs = null;
      totalObs = null;

      render(true);
      startObservers();
      scheduleStabilize();
    }, 0);
  });
})();
