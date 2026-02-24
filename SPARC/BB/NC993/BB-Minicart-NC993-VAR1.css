(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var headerSel = '.utility-overlay__header';
  var titleRowSel = '.utility-overlay__header .flex';
  var totalSel = '[data-totals-component="value"]';
  var msgSel = '.utility-overlay__footer-message';

  var bannerId = 'bb-complimentary-ship-banner';
  var THRESHOLD = 200;

  var lastTotal = null;

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
    sub.textContent = "Standard shipping is free with your order.";

    textWrap.appendChild(headline);
    textWrap.appendChild(sub);

    banner.appendChild(icon);
    banner.appendChild(textWrap);

    return banner;
  }

  function upsertBanner(ctx, total) {
    if (!ctx.header) return;

    var existing = ctx.header.querySelector('#' + bannerId);
    var qualified = total >= THRESHOLD;

    if (qualified) {
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

  function updateFooterMessage(ctx, total) {
    if (!ctx.msgEl) return;

    var next = total >= THRESHOLD
      ? 'Taxes calculated at checkout.'
      : 'Shipping and taxes calculated at checkout.';

    if (ctx.msgEl.textContent.trim() !== next) ctx.msgEl.textContent = next;
  }

  function render() {
    var ctx = getContext();
    if (!ctx) return;

    var total = parseMoney(ctx.totalEl.textContent);

    // Avoid thrashing: only rerender when total changes
    if (lastTotal !== null && Math.abs(total - lastTotal) < 0.001) return;
    lastTotal = total;

    upsertBanner(ctx, total);
    updateFooterMessage(ctx, total);
  }

  // --- Trigger strategy (live-safe) ---

  // Initial attempt
  render();

  // On ajax updates (best for SFRA minicart)
  if (window.jQuery && typeof window.jQuery === 'function') {
    window.jQuery(document).ajaxComplete(function () {
      // allow DOM swap to finish
      setTimeout(render, 0);
    });
  }

  // On user interaction that typically opens minicart (bounded retries)
  document.addEventListener('click', function () {
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      render();
      if (document.querySelector(overlaySel) || tries >= 10) clearInterval(t);
    }, 120);
  }, true);

  // SPA-ish navigation fallback
  window.addEventListener('popstate', function () {
    setTimeout(function () {
      lastTotal = null; // force refresh after nav
      render();
    }, 0);
  });
})();
