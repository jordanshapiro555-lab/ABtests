(function () {
  var overlaySel = '[data-minicart-component="overlay"]';
  var headerSel = '.utility-overlay__header';
  var titleRowSel = '.utility-overlay__header .flex';
  var totalSel = '[data-totals-component="value"]';
  var bannerId = 'bb-complimentary-ship-banner';
  var THRESHOLD = 200;

  function getTotalValue() {
    var el = document.querySelector(totalSel);
    if (!el) return 0;

    var text = el.textContent || '';
    var numeric = text.replace(/[^0-9.]/g, '');
    return parseFloat(numeric) || 0;
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

  function insertOrRemoveBanner() {
    var overlay = document.querySelector(overlaySel);
    if (!overlay) return;

    var header = overlay.querySelector(headerSel);
    if (!header) return;

    var total = getTotalValue();
    var existing = header.querySelector('#' + bannerId);

    if (total > THRESHOLD) {
      if (existing) return; // already injected

      var titleRow = overlay.querySelector(titleRowSel);
      var banner = buildBanner();

      if (titleRow && titleRow.parentNode === header) {
        header.insertBefore(banner, titleRow.nextSibling);
      } else {
        header.appendChild(banner);
      }

      // Match header padding for inset alignment
      var cs = window.getComputedStyle(header);
      banner.style.marginLeft = cs.paddingLeft;
      banner.style.marginRight = cs.paddingRight;

    } else {
      // Remove banner if total drops below threshold
      if (existing) existing.remove();
    }
  }

  insertOrRemoveBanner();

  var obs = new MutationObserver(function () {
    insertOrRemoveBanner();
  });

  obs.observe(document.body, { childList: true, subtree: true });
})();
