(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var totalsSel = '.utility-overlay__footer-totals';
  var totalValueSel = '[data-totals-component="value"]';
  var moduleId = 'bb-free-ship-progress';
  var THRESHOLD = 200;

  var overlayObserver = null;
  var scheduled = false;

  function parseMoney(text) {
    if (!text) return 0;
    var n = String(text).replace(/[^0-9.]/g, '');
    return parseFloat(n) || 0;
  }

  function formatDollars(amount) {
    return '$' + String(Math.ceil(amount));
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

  function setState(moduleEl, total) {
    var labelEl = moduleEl.querySelector('.bb-shipprog__label');
    var statusEl = moduleEl.querySelector('.bb-shipprog__status');
    var fillEl = moduleEl.querySelector('.bb-shipprog__fill');

    var remaining = THRESHOLD - total;
    var qualified = remaining <= 0;

    while (statusEl.firstChild) statusEl.removeChild(statusEl.firstChild);

    if (qualified) {
      labelEl.textContent = 'Order Qualified for Complimentary Shipping';

      var check = document.createElement('span');
      check.className = 'bb-shipprog__check';
      check.setAttribute('aria-hidden', 'true');
      check.innerHTML =
        '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="#fff" d="M6.35 11.2 3.2 8.05l1.06-1.06 2.09 2.09 5.41-5.41 1.06 1.06z"/>' +
        '</svg>';

      statusEl.appendChild(check);
      fillEl.style.width = '100%';
    } else {
      labelEl.textContent = formatDollars(remaining) + ' Away From Free Shipping';
      var pct = Math.max(0, Math.min(1, total / THRESHOLD));
      fillEl.style.width = String(Math.round(pct * 100)) + '%';
    }
  }

  function insertOrUpdate() {
    var overlay = document.querySelector(overlaySel);
    if (!overlay) return false;

    var totals = overlay.querySelector(totalsSel);
    if (!totals) return false;

    var totalEl = overlay.querySelector(totalValueSel);
    if (!totalEl) return false;

    var total = parseMoney(totalEl.textContent);

    var existing = totals.querySelector('#' + moduleId);
    if (!existing) {
      existing = buildModule();
      totals.insertBefore(existing, totals.firstChild);
    }

    setState(existing, total);
    return true;
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;

    // throttle updates to next tick (prevents mutation loops)
    setTimeout(function () {
      scheduled = false;
      insertOrUpdate();
    }, 50);
  }

  function attachOverlayObserver() {
    // If we already have an observer, don’t add another
    if (overlayObserver) return;

    var overlay = document.querySelector(overlaySel);
    if (!overlay) return;

    overlayObserver = new MutationObserver(function () {
      scheduleUpdate();
    });

    // Observe only the overlay subtree (tiny compared to whole document)
    overlayObserver.observe(overlay, { childList: true, subtree: true });

    // Initial paint
    insertOrUpdate();
  }

  function detachOverlayObserver() {
    if (!overlayObserver) return;
    overlayObserver.disconnect();
    overlayObserver = null;
  }

  // Lightweight “wait until minicart exists” (short + bounded)
  function boot(triesLeft) {
    if (insertOrUpdate()) {
      attachOverlayObserver();
      return;
    }
    if (triesLeft <= 0) return;
    setTimeout(function () { boot(triesLeft - 1); }, 200);
  }

  // Start (tries for ~6 seconds max)
  boot(30);

  // If the overlay is removed/re-added, reattach safely using a SMALL body observer.
  // This observer only watches for the overlay node presence changes.
  var bodyObs = new MutationObserver(function () {
    var overlayPresent = !!document.querySelector(overlaySel);
    if (overlayPresent) {
      attachOverlayObserver();
      scheduleUpdate();
    } else {
      detachOverlayObserver();
    }
  });
  bodyObs.observe(document.body, { childList: true, subtree: true });
})();
