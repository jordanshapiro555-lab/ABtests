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

  function render() {
    var ctx = getContext();
    if (!ctx) return;

    var total = parseMoney(ctx.totalEl.textContent);
    var hasMOD = hasMadeOnDemand(ctx);

    // Prevent thrashing: if neither total nor MOD presence changed, do nothing.
    if (
      lastTotal !== null &&
      lastHasMOD !== null &&
      Math.abs(total - lastTotal) < 0.001 &&
      hasMOD === lastHasMOD
    ) {
      return;
    }
    lastTotal = total;
    lastHasMOD = hasMOD;

    // IMPORTANT: "Make no changes if on-demand item is in cart"
    // - remove our module if it exists
    // - do not alter footer message
    if (hasMOD) {
      var existingMod = ctx.totals.querySelector('#' + moduleId);
      if (existingMod) existingMod.remove();
      return;
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
  }

  // --- Trigger strategy (no heavy MutationObservers) ---

  // 1) Run once at start
  render();

  // 2) On minicart open clicks (cheap + works without jQuery)
  document.addEventListener(
    'click',
    function () {
      // Short, bounded retries to catch async drawer render
      var tries = 0;
      var t = setInterval(function () {
        tries++;
        render();
        if (document.querySelector(overlaySel) || tries >= 10) clearInterval(t);
      }, 120);
    },
    true
  );

  // 3) If jQuery exists, hook into ajaxComplete (best for SFRA minicart updates)
  if (window.jQuery && typeof window.jQuery === 'function') {
    window.jQuery(document).ajaxComplete(function () {
      // render after ajax updates minicart HTML
      setTimeout(render, 0);
    });
  }

  // 4) Also re-render on history navigation in SPA-ish cases
  window.addEventListener('popstate', function () {
    setTimeout(render, 0);
  });
})();
